const mongoose = require('mongoose');

const exchangeRateSchema = new mongoose.Schema({
  key: { type: String, default: 'default', unique: true },
  base: { type: String, default: 'CAD' },
  rates: {
    CAD: { type: Number, default: 1 },
    USD: { type: Number, default: 0.74 },
    GBP: { type: Number, default: 0.58 },
    AED: { type: Number, default: 2.72 },
    LKR: { type: Number, default: 225 },
    JPY: { type: Number, default: 110 },
    KRW: { type: Number, default: 1000 },
  },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ExchangeRate', exchangeRateSchema);
