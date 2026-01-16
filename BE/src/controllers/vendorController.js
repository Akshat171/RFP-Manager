const { Vendor } = require('../models');

const createVendor = async (req, res) => {
  try {
    const { name, email, category, contactPerson } = req.body;

    // Validate required fields
    if (!name || !email || !category) {
      return res.status(400).json({
        error: 'Name, email, and category are required fields',
      });
    }

    // Check if vendor with email already exists
    const existingVendor = await Vendor.findOne({ email: email.toLowerCase() });
    if (existingVendor) {
      return res.status(409).json({
        error: 'Vendor with this email already exists',
      });
    }

    // Create new vendor
    const vendor = new Vendor({
      name,
      email,
      category,
      contactPerson,
    });

    await vendor.save();

    // Fetch all vendors after creating the new one
    const allVendors = await Vendor.find().sort({ createdAt: -1 });

    return res.status(201).json({
      message: 'Vendor created successfully',
      data: vendor,
      vendors: allVendors,
    });
  } catch (error) {
    console.error('Error in createVendor:', error.message);

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        error: 'Validation failed',
        details: messages,
      });
    }

    // Handle duplicate key error (email uniqueness)
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'Vendor with this email already exists',
      });
    }

    return res.status(500).json({
      error: 'Failed to create vendor. Please try again.',
    });
  }
};

const getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find().sort({ createdAt: -1 });

    return res.status(200).json({
      message: 'Vendors retrieved successfully',
      data: vendors,
      count: vendors.length,
    });
  } catch (error) {
    console.error('Error in getAllVendors:', error.message);

    return res.status(500).json({
      error: 'Failed to retrieve vendors. Please try again.',
    });
  }
};

module.exports = {
  createVendor,
  getAllVendors,
};
