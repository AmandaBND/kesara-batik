const test = require('node:test');
const assert = require('node:assert/strict');

const {
  toMinorUnits,
  toCurrencyMinorUnits,
  getCurrencyFractionDigits,
} = require('../src/utils/money');
const {
  getProductUnitPrice,
  buildOrderPricing,
} = require('../src/utils/orderPricing');
const { applyStockChangeForOrderItem } = require('../src/utils/stock');
const { canCancelOrder } = require('../src/utils/cancellation');

test('Genie amount converts LKR 8450.00 to 845000 minor units', () => {
  assert.equal(toMinorUnits(8450, 2), 845000);
});

test('Genie amount preserves cents correctly', () => {
  assert.equal(toMinorUnits(84.5, 2), 8450);
  assert.equal(toMinorUnits('8450.25', 2), 845025);
});

test('Genie uses the selected overseas currency total without another conversion', () => {
  assert.equal(toCurrencyMinorUnits(52.74, 'CAD'), 5274);
  assert.equal(toCurrencyMinorUnits(39.03, 'USD'), 3903);
  assert.equal(toCurrencyMinorUnits(30.59, 'GBP'), 3059);
  assert.equal(toCurrencyMinorUnits(143.45, 'AED'), 14345);
});

test('Genie uses zero decimal minor units for JPY and KRW', () => {
  assert.equal(getCurrencyFractionDigits('JPY'), 0);
  assert.equal(getCurrencyFractionDigits('KRW'), 0);
  assert.equal(toCurrencyMinorUnits(5800, 'JPY'), 5800);
  assert.equal(toCurrencyMinorUnits(52740, 'KRW'), 52740);
});

test('LKR unit price uses manual priceLKR and ignores exchange rate', () => {
  const product = { name: 'Batik Saree', price: 35, priceLKR: 8000 };
  assert.equal(getProductUnitPrice(product, 'LKR', { LKR: 999 }), 8000);
});

test('server pricing produces the expected LKR total', () => {
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
  });
});

test('server pricing converts the CAD price into the selected overseas currency', () => {
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
  });
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
