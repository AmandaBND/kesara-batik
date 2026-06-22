const asyncHandler = require('express-async-handler');
const { getExchangeRates, updateExchangeRates } = require('../services/exchangeRateService');

exports.getRates = asyncHandler(async (req, res) => {
  const doc = await getExchangeRates();
  res.json({ base: doc.base, rates: doc.rates, updatedAt: doc.updatedAt });
});

exports.refreshRates = asyncHandler(async (req, res) => {
  const doc = await updateExchangeRates();
  res.json({ base: doc.base, rates: doc.rates, updatedAt: doc.updatedAt });
});
