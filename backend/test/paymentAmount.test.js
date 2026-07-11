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

test('LKR unit price uses manual priceLKR and ignores exchange rate', () => {
  const product = { name: 'Batik Saree', price: 35, priceLKR: 8000 };
  assert.equal(getProductUnitPrice(product, 'LKR', { LKR: 999 }), 8000);
});

test('server pricing preserves the existing LKR total unchanged', () => {
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

test('server pricing converts CAD price into the selected overseas display currency', () => {
  const product = { name: 'Batik Saree', price: 35, priceLKR: 8000 };
  const rates = { CAD: 1, USD: 0.74, LKR: 225 };
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
    cadToLkrRate: 225,
    gatewayTotalLKR: 11925,
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
  assert.equal(toCurrencyMinorUnits(charge.gatewayAmountMajor, charge.gatewayCurrency), 845000);
});

test('USD order remains USD but Genie receives the saved CAD-derived LKR gateway total', () => {
  const charge = resolveGenieCharge({
    currency: 'USD',
    total: 39.22,
    totalCAD: 53,
    exchangeRate: 0.74,
    cadToLkrRate: 225,
    gatewayTotalLKR: 11925,
  });

  assert.deepEqual(charge, {
    checkoutCurrency: 'USD',
    checkoutAmount: 39.22,
    gatewayCurrency: 'LKR',
    gatewayAmountMajor: 11925,
    usesCadBase: true,
    convertedCadToLkrForGateway: true,
    cadBaseAmount: 53,
    gatewayExchangeRate: 225,
  });
  assert.equal(toCurrencyMinorUnits(charge.gatewayAmountMajor, charge.gatewayCurrency), 1192500);
});

test('CAD order remains CAD but Genie uses LKR because the merchant company currency is LKR', () => {
  const charge = resolveGenieCharge({
    currency: 'CAD',
    total: 93.99,
    totalCAD: 93.99,
    cadToLkrRate: 225,
  });

  assert.equal(charge.checkoutCurrency, 'CAD');
  assert.equal(charge.checkoutAmount, 93.99);
  assert.equal(charge.gatewayCurrency, 'LKR');
  assert.equal(charge.gatewayAmountMajor, 21147.75);
  assert.equal(charge.cadBaseAmount, 93.99);
  assert.equal(toCurrencyMinorUnits(charge.gatewayAmountMajor, 'LKR'), 2114775);
});

test('AED, JPY and KRW display orders all use an LKR Genie transaction', () => {
  for (const currency of ['AED', 'JPY', 'KRW']) {
    const charge = resolveGenieCharge({
      currency,
      total: 999,
      totalCAD: 53,
      cadToLkrRate: 225,
    });
    assert.equal(charge.checkoutCurrency, currency);
    assert.equal(charge.gatewayCurrency, 'LKR');
    assert.equal(charge.gatewayAmountMajor, 11925);
  }
});

test('old CAD orders can use checkout total plus a supplied current CAD-to-LKR rate', () => {
  const charge = resolveGenieCharge(
    { currency: 'CAD', total: 52.74 },
    { cadToLkrRate: 225 },
  );
  assert.equal(charge.gatewayCurrency, 'LKR');
  assert.equal(charge.gatewayAmountMajor, 11866.5);
});

test('old foreign orders reconstruct CAD and use a supplied current CAD-to-LKR rate', () => {
  const charge = resolveGenieCharge(
    {
      currency: 'USD',
      total: 39.22,
      exchangeRate: 0.74,
    },
    { cadToLkrRate: 225 },
  );
  assert.equal(charge.gatewayCurrency, 'LKR');
  assert.equal(charge.cadBaseAmount, 53);
  assert.equal(charge.gatewayAmountMajor, 11925);
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
