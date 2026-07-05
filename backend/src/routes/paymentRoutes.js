const express = require('express');
const router = express.Router();
const { createGeniePayment, genieWebhook, getGeniePaymentStatus, pingGenie } = require('../controllers/paymentController');
const { optionalAuth } = require('../middleware/auth');

// Dialog Genie
router.post('/genie/create',          optionalAuth, createGeniePayment);
// Genie sends GET first to verify the webhook URL is reachable — must return 200
router.get('/genie/webhook',          (req, res) => res.status(200).json({ status: 'ok', service: 'Kesara Bathik' }));
router.post('/genie/webhook',         genieWebhook);                  // called by Genie servers (real events)
router.get('/genie/status/:orderId',  optionalAuth, getGeniePaymentStatus);
router.get('/genie/ping',             pingGenie);                     // debug — remove after launch

module.exports = router;
