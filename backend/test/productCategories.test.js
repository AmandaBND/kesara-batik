const test = require('node:test');
const assert = require('node:assert/strict');
const { inferParentCategory, categoriesForParent } = require('../src/utils/productCategories');

test('infers parent categories from legacy product categories', () => {
  assert.equal(inferParentCategory("Women's Saree"), 'Women');
  assert.equal(inferParentCategory('Batik Shirts'), 'Men');
  assert.equal(inferParentCategory("Kid's Lama Saree"), 'Kids');
  assert.equal(inferParentCategory('Family Kits'), 'Family Kits');
  assert.equal(inferParentCategory('Bags'), 'Accessories');
});

test('returns legacy subcategories for clean category URLs', () => {
  assert.ok(categoriesForParent('Women').includes("Women's Saree"));
  assert.ok(categoriesForParent('Men').includes('Batik Shirts'));
  assert.deepEqual(categoriesForParent('Unknown'), []);
});
