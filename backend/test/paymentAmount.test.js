const test = require('node:test');
const assert = require('node:assert/strict');

const {
  toMinorUnits,
  toCurrencyMinorUnits,
} = require('../src/utils/money');
const {
  getProductUnitPrice,
  buildOrderPricing,
} = require('../src/utils/orderPricing');
const { resolveGenieCharge } = require('../src/utils/geniePricing');
const { applyStockChangeForOrderItem } = require('../src/utils/stock');
const { canCancelOrder } = require('../src/utils/cancellation');

test('LKR Genie amount converts 8450.00 to 845000 minor units', () => {
  assert.equal(toMinorUnits(8450, 2), 845000);
});

test('CAD Genie amount converts 52.74 to 5274 minor units', () => {
  assert.equal(toCurrencyMinorUnits(52.74, 'CAD'), 5274);
});

test('LKR unit price uses manual priceLKR and ignores exchange rate', () => {
  const product = { name: 'Batik Saree', price: 35, priceLKR: 8000 };
  assert.equal(getProductUnitPrice(product, 'LKR', { LKR: 999 }), 8000);
});

test('server pricing preserves LKR total and also records an unused CAD snapshot', () => {
  const pricing = buildOrderPricing({
    subtotal: 8000,
    subtotalCAD: 35,
    currency: 'LKR',
    rates: { CAD: 1, LKR: 225 },
  });

  assert.deepEqual(pricing, {
    subtotal: 8000,
    shipping: 450,
    tax: 0,
    discount: 0,
    total: 8450,
    currency: 'LKR',
    baseCurrency: 'CAD',
    subtotalCAD: 35,
    shippingCAD: 18,
    totalCAD: 53,
    exchangeRate: null,
  });
});

test('server pricing converts CAD price into selected overseas display currency', () => {
  const product = { name: 'Batik Saree', price: 35, priceLKR: 8000 };
  const rates = { CAD: 1, USD: 0.74 };
  const subtotalUSD = getProductUnitPrice(product, 'USD', rates);

  assert.equal(subtotalUSD, 25.9);
  assert.deepEqual(buildOrderPricing({
    subtotal: subtotalUSD,
    subtotalCAD: 35,
    currency: 'USD',
    rates,
  }), {
    subtotal: 25.9,
    shipping: 13.32,
    tax: 0,
    discount: 0,
    total: 39.22,
    currency: 'USD',
    baseCurrency: 'CAD',
    subtotalCAD: 35,
    shippingCAD: 18,
    totalCAD: 53,
    exchangeRate: 0.74,
  });
});

test('LKR checkout is sent to Genie unchanged in LKR', () => {
  const charge = resolveGenieCharge({
    currency: 'LKR',
    total: 8450,
    totalCAD: 53,
  });

  assert.deepEqual(charge, {
    checkoutCurrency: 'LKR',
    checkoutAmount: 8450,
    gatewayCurrency: 'LKR',
    gatewayAmountMajor: 8450,
    usesCadBase: false,
  });
});

test('USD display order is sent to Genie using its independent CAD base total', () => {
  const charge = resolveGenieCharge({
    currency: 'USD',
    total: 39.22,
    totalCAD: 53,
    exchangeRate: 0.74,
  });

  assert.deepEqual(charge, {
    checkoutCurrency: 'USD',
    checkoutAmount: 39.22,
    gatewayCurrency: 'CAD',
    gatewayAmountMajor: 53,
    usesCadBase: true,
  });
  assert.equal(toCurrencyMinorUnits(charge.gatewayAmountMajor, charge.gatewayCurrency), 5300);
});

test('AED, JPY and KRW display orders do not send unsupported currencies to Genie', () => {
  for (const currency of ['AED', 'JPY', 'KRW']) {
    const charge = resolveGenieCharge({
      currency,
      total: 999,
      totalCAD: 53,
      exchangeRate: 2,
    });
    assert.equal(charge.gatewayCurrency, 'CAD');
    assert.equal(charge.gatewayAmountMajor, 53);
  }
});

test('old CAD orders can use their checkout total as the CAD gateway total', () => {
  const charge = resolveGenieCharge({ currency: 'CAD', total: 52.74 });
  assert.equal(charge.gatewayCurrency, 'CAD');
  assert.equal(charge.gatewayAmountMajor, 52.74);
});

test('old foreign orders can reconstruct CAD from their saved exchange rate', () => {
  const charge = resolveGenieCharge({
    currency: 'USD',
    total: 39.22,
    exchangeRate: 0.74,
  });
  assert.equal(charge.gatewayCurrency, 'CAD');
  assert.equal(charge.gatewayAmountMajor, 53);
});

test('stock is reduced when an order item is applied as a payment-success change', () => {
  const product = { stockCount: 10, soldCount: 2, variants: [] };
  applyStockChangeForOrderItem(product, { quantity: 3 }, { decrement: true });

  assert.equal(product.stockCount, 7);
  assert.equal(product.soldCount, 5);
});

test('stock is not reduced for a non-payment-success change', () => {
  const product = { stockCount: 10, soldCount: 2, variants: [] };
  applyStockChangeForOrderItem(product, { quantity: 3 }, { decrement: false });

  assert.equal(product.stockCount, 10);
  assert.equal(product.soldCount, 2);
});

test('stock is restored when an order item is removed from inventory', () => {
  const product = { stockCount: 7, soldCount: 5, variants: [] };
  applyStockChangeForOrderItem(product, { quantity: 3 }, { restore: true });

  assert.equal(product.stockCount, 10);
  assert.equal(product.soldCount, 2);
});

test('orders can be cancelled within the first 24 hours', () => {
  const now = new Date('2026-07-10T12:00:00.000Z');
  const order = { createdAt: new Date('2026-07-09T15:00:00.000Z') };

  assert.equal(canCancelOrder(order, now), true);
});

test('orders cannot be cancelled after the 24-hour window', () => {
  const now = new Date('2026-07-10T12:00:00.000Z');
  const order = { createdAt: new Date('2026-07-08T12:00:00.000Z') };

  assert.equal(canCancelOrder(order, now), false);
});
