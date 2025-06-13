// routes/checkout.js
const express = require('express');
const { createCheckoutSession } = require('../controllers/checkoutController');

const router = express.Router();

// POST /api/checkout/create-checkout-session
router.post('/create-checkout-session', createCheckoutSession);

module.exports = router;
