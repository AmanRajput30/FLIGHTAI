const express = require('express');
const FlightSelectionService = require('../services/FlightSelectionService');
const rateLimit = require('express-rate-limit');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const detailLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 min
  max: 30, // 30 requests per minute per IP for flight details
  message: { error: 'Too many detail requests, please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Input validation: hex IDs are 6 hex chars, but we also accept callsigns up to 10 alphanumeric
const VALID_ID = /^[a-fA-F0-9]{6}$/;

router.get('/details/:id', detailLimiter, requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Reject obviously malformed IDs
    if (!id || id.length < 2 || id.length > 10 || !/^[a-zA-Z0-9]+$/.test(id)) {
      return res.status(400).json({ error: 'Invalid flight identifier format.' });
    }

    const details = await FlightSelectionService.getDetails(id);
    res.json(details);
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    console.error('[FlightRoute] Error fetching details:', error);
    res.status(500).json({ error: 'Failed to fetch normalized flight details' });
  }
});

module.exports = router;

