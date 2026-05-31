const ExchangeRate = require('../models/ExchangeRate');

const DEFAULT_RATES = {
  CAD: 1,
  USD: 0.74,
  GBP: 0.58,
  AED: 2.72,
  LKR: 225,
  JPY: 110,
  KRW: 1000,
};

const CURRENCIES = ['USD', 'GBP', 'AED', 'LKR', 'JPY', 'KRW'];

async function fetchRatesFromApi() {
  const res = await fetch('https://open.er-api.com/v6/latest/CAD');
  if (!res.ok) throw new Error(`Exchange rate API error: ${res.status}`);
  const data = await res.json();
  if (data.result !== 'success') throw new Error('Exchange rate API returned an error');
  const rates = { CAD: 1 };
  for (const code of CURRENCIES) {
    if (data.rates?.[code]) rates[code] = data.rates[code];
  }
  return { ...DEFAULT_RATES, ...rates };
}

async function updateExchangeRates() {
  try {
    const fetched = await fetchRatesFromApi();
    const existing = await ExchangeRate.findOne({ key: 'default' });
    const rates = { ...(existing?.rates?.toObject?.() || existing?.rates || DEFAULT_RATES), ...fetched };
    const doc = await ExchangeRate.findOneAndUpdate(
      { key: 'default' },
      { rates, base: 'CAD', updatedAt: new Date() },
      { upsert: true, new: true }
    );
    console.log('Exchange rates updated:', doc.updatedAt.toISOString());
    return doc;
  } catch (err) {
    console.error('Failed to update exchange rates:', err.message);
    const existing = await ExchangeRate.findOne({ key: 'default' });
    if (!existing) {
      return ExchangeRate.create({ key: 'default', rates: DEFAULT_RATES, base: 'CAD' });
    }
    return existing;
  }
}

async function getExchangeRates() {
  let doc = await ExchangeRate.findOne({ key: 'default' });
  if (!doc) {
    doc = await ExchangeRate.create({ key: 'default', rates: DEFAULT_RATES, base: 'CAD' });
  }
  return doc;
}

module.exports = { updateExchangeRates, getExchangeRates, DEFAULT_RATES };
