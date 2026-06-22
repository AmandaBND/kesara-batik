const express = require('express');
const router = express.Router();
const { getRates, refreshRates } = require('../controllers/currencyController');
const { protect, admin } = require('../middleware/auth');

router.get('/rates', getRates);
router.post('/rates/refresh', protect, admin, refreshRates);

module.exports = router;
