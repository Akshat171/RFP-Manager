const express = require('express');
const router = express.Router();
const {
  receiveVendorResponse,
  getProposalsForRFP,
  getAllProposals,
  submitProposalManually,
  handleGmailPubSubWebhook,
  updateRFPStatus,
} = require('../controllers/proposalController');

// POST /api/proposals/webhook - Receive vendor email responses (webhook)
router.post('/webhook', receiveVendorResponse);

// POST /api/proposals/gmail-webhook - Receive Gmail Pub/Sub push notifications
router.post('/gmail-webhook', handleGmailPubSubWebhook);

// POST /api/proposals/manual - Manually submit vendor proposal
router.post('/manual', submitProposalManually);

// GET /api/proposals - Get all proposals
router.get('/', getAllProposals);

// GET /api/proposals/rfp/:rfpId - Get proposals for specific RFP
router.get('/rfp/:rfpId', getProposalsForRFP);

// PATCH /api/proposals/rfp/:rfpId - Update RFP status
router.patch('/rfp/:rfpId', updateRFPStatus);

module.exports = router;
