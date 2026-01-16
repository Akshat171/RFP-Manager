const express = require('express');
const router = express.Router();
const { parseRFP, dispatchRFP, getActiveRFPs, getRFPStats, saveDraft, getDrafts, deleteDraft } = require('../controllers/rfpController');

// GET /api/rfps/active - Get all active (published) RFPs
router.get('/active', getActiveRFPs);

// GET /api/rfps/drafts - Get all draft RFPs
router.get('/drafts', getDrafts);

// GET /api/rfps/:rfpId/stats - Get response statistics for an RFP
router.get('/:rfpId/stats', getRFPStats);

// POST /api/rfps/parse - Parse natural language RFP description
router.post('/parse', parseRFP);

// POST /api/rfps/:id/draft - Save RFP as draft with selected vendors
router.post('/:id/draft', saveDraft);

// POST /api/rfps/:id/dispatch - Dispatch RFP to vendors via email
router.post('/:id/dispatch', dispatchRFP);

// DELETE /api/rfps/:id - Delete a draft RFP
router.delete('/:id', deleteDraft);

module.exports = router;
