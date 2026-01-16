const { Proposal, RFP, Vendor } = require('../models');
const { parseProposalEmail, compareProposalToRFP } = require('../services/aiService');
const gmailPushService = require('../services/gmailPushService');

const receiveVendorResponse = async (req, res) => {
  try {
    // Email webhook payload (format varies by provider)
    const { from, to, subject, html, text } = req.body;

    // Extract vendor email
    const vendorEmail = from;

    // Find vendor by email
    const vendor = await Vendor.findOne({ email: vendorEmail });
    if (!vendor) {
      console.log('Vendor not found for email:', vendorEmail);
      return res.status(200).json({ message: 'Vendor not registered' });
    }

    // Extract RFP ID from email subject or find latest RFP sent to this vendor
    // For now, find the most recent proposal for this vendor
    const existingProposal = await Proposal.findOne({ vendorId: vendor._id })
      .sort({ receivedAt: -1 })
      .populate('rfpId');

    if (!existingProposal) {
      console.log('No RFP found for vendor:', vendorEmail);
      return res.status(200).json({ message: 'No matching RFP found' });
    }

    const rfpId = existingProposal.rfpId._id;

    // Use AI to extract structured data from email
    const emailBody = html || text;
    const extractedData = await parseProposalEmail(emailBody);

    // Create or update proposal
    const proposal = await Proposal.findOneAndUpdate(
      { rfpId: rfpId, vendorId: vendor._id },
      {
        rfpId: rfpId,
        vendorId: vendor._id,
        rawEmailBody: emailBody,
        extractedData: extractedData,
        receivedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    console.log('Proposal received from vendor:', vendor.name);

    return res.status(200).json({
      message: 'Vendor response processed successfully',
      data: proposal,
    });
  } catch (error) {
    console.error('Error in receiveVendorResponse:', error.message);

    // Return 200 to prevent email provider from retrying
    return res.status(200).json({
      message: 'Error processing vendor response',
      error: error.message,
    });
  }
};

const getProposalsForRFP = async (req, res) => {
  try {
    const { rfpId } = req.params;

    // Find RFP to get requirements
    const rfp = await RFP.findById(rfpId);
    if (!rfp) {
      return res.status(404).json({
        error: 'RFP not found',
      });
    }

    // Find all proposals for this RFP
    const proposals = await Proposal.find({ rfpId })
      .populate('vendorId', 'name email category')
      .sort({ receivedAt: -1 });

    // Analyze compliance for each proposal
    const proposalsWithCompliance = await Promise.all(
      proposals.map(async (proposal) => {
        // Only analyze if proposal has extracted data and compliance hasn't been checked yet
        if (proposal.extractedData && proposal.complianceStatus.fulfilled === null) {
          try {
            const complianceResult = await compareProposalToRFP(
              rfp.structuredData,
              proposal.extractedData
            );

            // Update proposal with compliance status
            proposal.complianceStatus = complianceResult;
            await proposal.save();
          } catch (error) {
            console.error('Error analyzing compliance for proposal:', proposal._id, error.message);
            // Continue with other proposals even if one fails
          }
        }

        return proposal;
      })
    );

    return res.status(200).json({
      message: 'Proposals retrieved successfully',
      data: proposalsWithCompliance,
      count: proposalsWithCompliance.length,
    });
  } catch (error) {
    console.error('Error in getProposalsForRFP:', error.message);

    return res.status(500).json({
      error: 'Failed to retrieve proposals. Please try again.',
    });
  }
};

const getAllProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find()
      .populate('rfpId', 'originalDescription status')
      .populate('vendorId', 'name email category')
      .sort({ receivedAt: -1 });

    return res.status(200).json({
      message: 'All proposals retrieved successfully',
      data: proposals,
      count: proposals.length,
    });
  } catch (error) {
    console.error('Error in getAllProposals:', error.message);

    return res.status(500).json({
      error: 'Failed to retrieve proposals. Please try again.',
    });
  }
};

const submitProposalManually = async (req, res) => {
  try {
    const { rfpId, vendorId, emailBody } = req.body;

    // Validate required fields
    if (!rfpId || !vendorId || !emailBody) {
      return res.status(400).json({
        error: 'rfpId, vendorId, and emailBody are required',
      });
    }

    // Verify RFP exists
    const rfp = await RFP.findById(rfpId);
    if (!rfp) {
      return res.status(404).json({
        error: 'RFP not found',
      });
    }

    // Verify vendor exists
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({
        error: 'Vendor not found',
      });
    }

    // Parse email with AI
    const extractedData = await parseProposalEmail(emailBody);

    // Create or update proposal
    const proposal = await Proposal.findOneAndUpdate(
      { rfpId: rfpId, vendorId: vendorId },
      {
        rfpId: rfpId,
        vendorId: vendorId,
        vendorResponseEmail: emailBody,  // Store in vendorResponseEmail field
        extractedData: extractedData,
        receivedAt: new Date(),
      },
      { upsert: true, new: true }
    ).populate('vendorId', 'name email category');

    console.log('Manual proposal submitted for vendor:', vendor.name);

    return res.status(201).json({
      message: 'Proposal submitted successfully',
      data: proposal,
    });
  } catch (error) {
    console.error('Error in submitProposalManually:', error.message);

    if (error.message.includes('AI')) {
      return res.status(503).json({
        error: 'AI service unavailable. Please try again later.',
      });
    }

    return res.status(500).json({
      error: 'Failed to submit proposal. Please try again.',
    });
  }
};

const handleGmailPubSubWebhook = async (req, res) => {
  try {
    console.log('Received Gmail Pub/Sub webhook');

    // Process the push notification asynchronously
    gmailPushService.handlePushNotification(req.body).catch((error) => {
      console.error('Error processing Gmail push notification:', error.message);
    });

    // Respond immediately to acknowledge receipt
    return res.status(200).send('OK');
  } catch (error) {
    console.error('Error in handleGmailPubSubWebhook:', error.message);
    return res.status(200).send('OK'); // Still return 200 to prevent retries
  }
};

const updateRFPStatus = async (req, res) => {
  try {
    const { rfpId } = req.params;
    let { status } = req.body;

    // Validate status
    if (!status) {
      return res.status(400).json({
        error: 'status is required',
      });
    }

    // Map "completed" to "closed" for backward compatibility
    if (status === 'completed') {
      status = 'closed';
    }

    // Validate status value
    const validStatuses = ['draft', 'published', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}, completed`,
      });
    }

    // Find and update RFP
    const rfp = await RFP.findById(rfpId);
    if (!rfp) {
      return res.status(404).json({
        error: 'RFP not found',
      });
    }

    // Update status
    rfp.status = status;
    await rfp.save();

    // Get all proposals for this RFP with compliance analysis
    const proposals = await Proposal.find({ rfpId })
      .populate('vendorId', 'name email category')
      .sort({ receivedAt: -1 });

    // Analyze compliance for each proposal if not already done
    const proposalsWithCompliance = await Promise.all(
      proposals.map(async (proposal) => {
        if (proposal.extractedData && proposal.complianceStatus.fulfilled === null) {
          try {
            const complianceResult = await compareProposalToRFP(
              rfp.structuredData,
              proposal.extractedData
            );

            proposal.complianceStatus = complianceResult;
            await proposal.save();
          } catch (error) {
            console.error('Error analyzing compliance for proposal:', proposal._id, error.message);
          }
        }

        return proposal;
      })
    );

    return res.status(200).json({
      message: 'RFP status updated successfully',
      rfp: {
        _id: rfp._id,
        status: rfp.status,
        originalDescription: rfp.originalDescription,
        structuredData: rfp.structuredData,
        createdAt: rfp.createdAt,
        updatedAt: rfp.updatedAt,
      },
      proposals: proposalsWithCompliance,
      proposalsCount: proposalsWithCompliance.length,
    });
  } catch (error) {
    console.error('Error in updateRFPStatus:', error.message);

    return res.status(500).json({
      error: 'Failed to update RFP status. Please try again.',
    });
  }
};

module.exports = {
  receiveVendorResponse,
  getProposalsForRFP,
  getAllProposals,
  submitProposalManually,
  handleGmailPubSubWebhook,
  updateRFPStatus,
};
