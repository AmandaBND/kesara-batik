const test = require('node:test');
const assert = require('node:assert/strict');

const { toMinorUnits } = require('../src/utils/money');
const {
  getProductUnitPrice,
  buildOrderPricing,
} = require('../src/utils/orderPricing');

test('Genie amount converts LKR 8450.00 to 845000 minor units', () => {
  assert.equal(toMinorUnits(8450, 2), 845000);
});

test('Genie amount preserves cents correctly', () => {
  assert.equal(toMinorUnits(84.5, 2), 8450);
  assert.equal(toMinorUnits('8450.25', 2), 845025);
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
