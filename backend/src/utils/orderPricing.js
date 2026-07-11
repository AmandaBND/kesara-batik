const { roundMoney } = require('./money');

const LKR_SHIPPING = 450;
const CAD_FREE_SHIPPING_THRESHOLD = 120;
const CAD_SHIPPING = 18;
const SUPPORTED_CURRENCIES = new Set(['CAD', 'USD', 'GBP', 'AED', 'LKR', 'JPY', 'KRW']);

function normalizeCurrency(value) {
  const currency = String(value || '').trim().toUpperCase();
  if (!SUPPORTED_CURRENCIES.has(currency)) {
    throw new Error('Unsupported checkout currency.');
  }
  return currency;
}

function getRate(currency, rates = {}) {
  if (currency === 'CAD') return 1;
  const rate = Number(rates[currency]);
  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error(`Exchange rate for ${currency} is unavailable.`);
  }
  return rate;
}

/**
 * LKR is intentionally NOT calculated from the CAD price. Every product must
 * have its own manually maintained priceLKR value.
 */
function getProductUnitPrice(product, currency, rates = {}) {
  if (currency === 'LKR') {
    const manualLkrPrice = Number(product?.priceLKR);
    if (!Number.isFinite(manualLkrPrice) || manualLkrPrice <= 0) {
      throw new Error(`${product?.name || 'Product'}: LKR price is not configured.`);
    }
    return manualLkrPrice;
  }

  const cadPrice = Number(product?.price);
  if (!Number.isFinite(cadPrice) || cadPrice < 0) {
    throw new Error(`${product?.name || 'Product'}: CAD price is invalid.`);
  }

  return cadPrice * getRate(currency, rates);
}

function calculateShippingCAD(subtotalCAD) {
  return Number(subtotalCAD) > CAD_FREE_SHIPPING_THRESHOLD ? 0 : CAD_SHIPPING;
}

function calculateShipping(subtotalCAD, currency, rates = {}) {
  if (currency === 'LKR') return LKR_SHIPPING;
  return calculateShippingCAD(subtotalCAD) * getRate(currency, rates);
}

function buildOrderPricing({ subtotal, subtotalCAD, currency, rates = {} }) {
  const normalizedCurrency = normalizeCurrency(currency);
  const shipping = calculateShipping(subtotalCAD, normalizedCurrency, rates);
  const shippingCAD = calculateShippingCAD(subtotalCAD);
  const safeSubtotal = roundMoney(subtotal);
  const safeShipping = roundMoney(shipping);
  const safeSubtotalCAD = roundMoney(subtotalCAD);
  const safeShippingCAD = roundMoney(shippingCAD);
  const exchangeRate = normalizedCurrency === 'LKR'
    ? null
    : getRate(normalizedCurrency, rates);

  return {
    subtotal: safeSubtotal,
    shipping: safeShipping,
    tax: 0,
    discount: 0,
    total: roundMoney(safeSubtotal + safeShipping),
    currency: normalizedCurrency,

    // Independent CAD snapshot used only for overseas Genie payments.
    // LKR pricing remains separate and never uses these values.
    baseCurrency: 'CAD',
    subtotalCAD: safeSubtotalCAD,
    shippingCAD: safeShippingCAD,
    totalCAD: roundMoney(safeSubtotalCAD + safeShippingCAD),
    exchangeRate,
  };
}

module.exports = {
  LKR_SHIPPING,
  CAD_FREE_SHIPPING_THRESHOLD,
  CAD_SHIPPING,
  SUPPORTED_CURRENCIES,
  normalizeCurrency,
  getProductUnitPrice,
  calculateShippingCAD,
  calculateShipping,
  buildOrderPricing,
};
