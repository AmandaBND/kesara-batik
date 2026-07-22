require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../src/models/Product');
const { inferParentCategory } = require('../src/utils/productCategories');

async function run() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  const products = await Product.find({
    $or: [
      { parentCategory: { $exists: false } },
      { parentCategory: null },
      { parentCategory: '' },
    ],
  }).select('_id name category parentCategory');

  let updated = 0;
  let skipped = 0;

  for (const product of products) {
    const parentCategory = inferParentCategory(product.category);
    if (!parentCategory) {
      skipped += 1;
      console.log(`[category-backfill] Skipped: ${product.name} (${product.category})`);
      continue;
    }

    product.parentCategory = parentCategory;
    await product.save();
    updated += 1;
    console.log(`[category-backfill] ${product.name} → ${parentCategory}`);
  }

  console.log(`[category-backfill] Complete. Updated: ${updated}, skipped: ${skipped}`);
  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error('[category-backfill] Failed:', error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
