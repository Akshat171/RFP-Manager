const { RFP, Vendor, Proposal } = require('../models');
const { parseRFPDescription } = require('../services/aiService');
const emailService = require('../services/emailService');

const parseRFP = async (req, res) => {
  try {
    const { description } = req.body;

    if (!description || typeof description !== 'string' || description.trim() === '') {
      return res.status(400).json({
        error: 'Description is required and must be a non-empty string',
      });
    }

    // Get all unique vendor categories from database
    const allVendors = await Vendor.find();
    const availableCategories = [...new Set(allVendors.map((v) => v.category))];
    console.log('Available vendor categories:', availableCategories);

    // Call OpenAI to parse the description with category hints
    const structuredData = await parseRFPDescription(description, availableCategories);

    // Validate the structured data has expected fields
    if (!structuredData || typeof structuredData !== 'object') {
      return res.status(500).json({
        error: 'Failed to extract structured data from description',
      });
    }

    // Extract categories from structured data
    const primaryCategory = structuredData.category;
    const suggestedCategories = structuredData.suggestedCategories || [primaryCategory];

    console.log('Primary category:', primaryCategory);
    console.log('Suggested categories:', suggestedCategories);

    // Fetch vendors matching ANY of the suggested categories (better matching)
    let matchingVendors = [];
    if (suggestedCategories && suggestedCategories.length > 0) {
      // Create regex patterns for each suggested category
      const categoryPatterns = suggestedCategories.map(
        (cat) => new RegExp(cat, 'i')
      );

      matchingVendors = await Vendor.find({
        $or: categoryPatterns.map((pattern) => ({ category: pattern })),
      }).sort({ createdAt: -1 });

      console.log(`Found ${matchingVendors.length} matching vendors`);
    }

    // Create new RFP document in MongoDB
    const rfp = new RFP({
      originalDescription: description,
      structuredData: structuredData,
    });

    await rfp.save();

    return res.status(201).json({
      message: 'RFP created successfully',
      rfpId: rfp._id,
      data: rfp,
      vendors: matchingVendors,
      vendorsCount: matchingVendors.length,
    });
  } catch (error) {
    console.error('Error in parseRFP:', error.message);

    if (error.message.includes('AI')) {
      return res.status(503).json({
        error: 'AI service unavailable. Please try again later.',
      });
    }

    return res.status(500).json({
      error: 'Failed to create RFP. Please try again.',
    });
  }
};

const dispatchRFP = async (req, res) => {
  try {
    const { id } = req.params;
    const { vendorIds } = req.body;

    // Validate vendorIds
    if (!vendorIds || !Array.isArray(vendorIds) || vendorIds.length === 0) {
      return res.status(400).json({
        error: 'vendorIds is required and must be a non-empty array',
      });
    }

    // Fetch the RFP
    const rfp = await RFP.findById(id);
    if (!rfp) {
      return res.status(404).json({
        error: 'RFP not found',
      });
    }

    // Fetch the vendors
    const vendors = await Vendor.find({ _id: { $in: vendorIds } });
    if (vendors.length === 0) {
      return res.status(404).json({
        error: 'No vendors found with the provided IDs',
      });
    }

    const results = [];
    const errors = [];

    // Loop through vendors and send emails
    for (const vendor of vendors) {
      try {
        await emailService.sendRFP(vendor.email, vendor.name, rfp.structuredData);

        // Create or update proposal status to SENT
        await Proposal.findOneAndUpdate(
          { rfpId: rfp._id, vendorId: vendor._id },
          {
            rfpId: rfp._id,
            vendorId: vendor._id,
            rawEmailBody: 'Email sent via automated system',
            receivedAt: new Date(),
          },
          { upsert: true, new: true }
        );

        results.push({
          vendorId: vendor._id,
          vendorName: vendor.name,
          email: vendor.email,
          status: 'SENT',
        });
      } catch (emailError) {
        console.error(`Failed to send email to ${vendor.email}:`, emailError.message);
        errors.push({
          vendorId: vendor._id,
          vendorName: vendor.name,
          email: vendor.email,
          status: 'FAILED',
          error: emailError.message,
        });
      }
    }

    // Update RFP status to published and add vendor IDs if at least one email was sent successfully
    if (results.length > 0) {
      const successfulVendorIds = results.map((r) => r.vendorId);

      // Add vendor IDs to sentToVendors array (avoiding duplicates)
      const newVendorIds = successfulVendorIds.filter(
        (vendorId) => !rfp.sentToVendors.some((id) => id.equals(vendorId))
      );

      if (newVendorIds.length > 0) {
        rfp.sentToVendors.push(...newVendorIds);
      }

      // Update status to published if still draft
      if (rfp.status === 'draft') {
        rfp.status = 'published';
      }

      await rfp.save();
    }

    return res.status(200).json({
      message: 'RFP dispatch completed',
      successful: results.length,
      failed: errors.length,
      rfpStatus: rfp.status,
      sentToVendors: rfp.sentToVendors,
      results: results,
      errors: errors,
    });
  } catch (error) {
    console.error('Error in dispatchRFP:', error.message);

    return res.status(500).json({
      error: 'Failed to dispatch RFP. Please try again.',
    });
  }
};

const getActiveRFPs = async (req, res) => {
  try {
    const activeRFPs = await RFP.find({ status: 'published' }).sort({ createdAt: -1 });

    // Add response statistics to each RFP using stored data
    const rfpsWithStats = activeRFPs.map((rfp) => {
      const rfpObj = rfp.toObject();

      const totalResponses = rfp.respondedVendors?.length || 0;
      const totalVendorsContacted = rfp.sentToVendors?.length || 0;

      // Add response statistics
      rfpObj.responseStats = {
        totalResponses: totalResponses,
        totalVendorsContacted: totalVendorsContacted,
        pendingResponses: totalVendorsContacted - totalResponses,
        responseRate: totalVendorsContacted > 0
          ? Math.round((totalResponses / totalVendorsContacted) * 100)
          : 0,
      };

      return rfpObj;
    });

    return res.status(200).json({
      message: 'Active RFPs retrieved successfully',
      data: rfpsWithStats,
      count: rfpsWithStats.length,
    });
  } catch (error) {
    console.error('Error in getActiveRFPs:', error.message);

    return res.status(500).json({
      error: 'Failed to retrieve active RFPs. Please try again.',
    });
  }
};

const getRFPStats = async (req, res) => {
  try {
    const { rfpId } = req.params;

    // Get RFP details
    const rfp = await RFP.findById(rfpId);
    if (!rfp) {
      return res.status(404).json({ error: 'RFP not found' });
    }

    // Count total proposals/responses
    const totalResponses = await Proposal.countDocuments({ rfpId: rfpId });
    const totalVendorsContacted = rfp.sentToVendors?.length || 0;

    // Get all proposals with vendor details
    const proposals = await Proposal.find({ rfpId })
      .populate('vendorId', 'name email')
      .select('vendorId receivedAt extractedData');

    const responseStats = {
      rfpId: rfpId,
      totalVendorsContacted: totalVendorsContacted,
      totalResponses: totalResponses,
      pendingResponses: totalVendorsContacted - totalResponses,
      responseRate: totalVendorsContacted > 0
        ? Math.round((totalResponses / totalVendorsContacted) * 100)
        : 0,
      respondedVendors: proposals.map((p) => ({
        vendorId: p.vendorId._id,
        vendorName: p.vendorId.name,
        receivedAt: p.receivedAt,
        price: p.extractedData.totalPrice,
      })),
    };

    return res.status(200).json({
      message: 'RFP statistics retrieved successfully',
      data: responseStats,
    });
  } catch (error) {
    console.error('Error in getRFPStats:', error.message);
    return res.status(500).json({
      error: 'Failed to retrieve RFP statistics',
    });
  }
};

const saveDraft = async (req, res) => {
  try {
    const { id } = req.params;
    const { vendorIds } = req.body;

    // Validate vendorIds
    if (!vendorIds || !Array.isArray(vendorIds) || vendorIds.length === 0) {
      return res.status(400).json({
        error: 'vendorIds is required and must be a non-empty array',
      });
    }

    // Fetch the RFP
    const rfp = await RFP.findById(id);
    if (!rfp) {
      return res.status(404).json({
        error: 'RFP not found',
      });
    }

    // Verify vendors exist
    const vendors = await Vendor.find({ _id: { $in: vendorIds } });
    if (vendors.length !== vendorIds.length) {
      return res.status(404).json({
        error: 'Some vendors not found',
      });
    }

    // Update RFP with selected vendors and keep status as draft
    rfp.selectedVendors = vendorIds;
    rfp.status = 'draft';
    await rfp.save();

    return res.status(200).json({
      message: 'Draft saved successfully',
      data: rfp,
    });
  } catch (error) {
    console.error('Error in saveDraft:', error.message);

    return res.status(500).json({
      error: 'Failed to save draft. Please try again.',
    });
  }
};

const getDrafts = async (req, res) => {
  try {
    // Find all RFPs with status 'draft'
    const drafts = await RFP.find({ status: 'draft' })
      .populate('selectedVendors', 'name email category')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: 'Drafts retrieved successfully',
      data: drafts,
      count: drafts.length,
    });
  } catch (error) {
    console.error('Error in getDrafts:', error.message);

    return res.status(500).json({
      error: 'Failed to retrieve drafts. Please try again.',
    });
  }
};

const deleteDraft = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the RFP
    const rfp = await RFP.findById(id);
    if (!rfp) {
      return res.status(404).json({
        error: 'RFP not found',
      });
    }

    // Only allow deletion of drafts
    if (rfp.status !== 'draft') {
      return res.status(400).json({
        error: 'Only draft RFPs can be deleted',
      });
    }

    // Delete the RFP
    await RFP.findByIdAndDelete(id);

    return res.status(200).json({
      message: 'Draft deleted successfully',
    });
  } catch (error) {
    console.error('Error in deleteDraft:', error.message);

    return res.status(500).json({
      error: 'Failed to delete draft. Please try again.',
    });
  }
};

module.exports = {
  parseRFP,
  dispatchRFP,
  getActiveRFPs,
  getRFPStats,
  saveDraft,
  getDrafts,
  deleteDraft,
};
