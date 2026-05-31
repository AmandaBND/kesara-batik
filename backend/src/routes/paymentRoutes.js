// paymentRoutes.js
const express = require('express');
const router = express.Router();
const { createStripeIntent, stripeWebhook, createPaypalOrder, capturePaypalOrder } = require('../controllers/paymentController');
const { protect, optionalAuth } = require('../middleware/auth');

router.post('/stripe/intent', optionalAuth, createStripeIntent);
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhook);
router.post('/paypal/create', optionalAuth, createPaypalOrder);
router.post('/paypal/capture', optionalAuth, capturePaypalOrder);

module.exports = router;
