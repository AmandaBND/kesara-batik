function findVariant(product, { size, color } = {}) {
  if (!product?.variants?.length) return null;
  return product.variants.find(v =>
    (v.size || '') === (size || '') &&
    (v.color || '') === (color || '')
  );
}

function getAvailableStock(product, variant = {}) {
  if (product?.variants?.length) {
    const v = findVariant(product, variant);
    return v ? Math.max(0, Number(v.stock) || 0) : 0;
  }
  return Math.max(0, Number(product?.stockCount) || 0);
}

module.exports = { findVariant, getAvailableStock };
