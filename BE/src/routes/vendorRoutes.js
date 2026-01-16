const express = require('express');
const router = express.Router();
const { createVendor, getAllVendors } = require('../controllers/vendorController');

// GET /api/vendors - Get all vendors
router.get('/', getAllVendors);

// POST /api/vendors - Create new vendor
router.post('/', createVendor);

module.exports = router;
