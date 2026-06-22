export function findVariant(product, { size, color } = {}) {
  if (!product?.variants?.length) return null;
  return product.variants.find(v =>
    (v.size || '') === (size || '') &&
    (v.color || '') === (color || '')
  );
}

export function getAvailableStock(product, variant = {}) {
  if (product?.variants?.length) {
    const v = findVariant(product, variant);
    return v ? Math.max(0, Number(v.stock) || 0) : 0;
  }
  return Math.max(0, Number(product?.stockCount) || 0);
}

export function hasVariants(product) {
  return product?.variants?.some(v => v.size || v.color);
}

export function getCartQtyForVariant(items, productId, variant = {}) {
  const key = `${productId}-${variant.size || ''}-${variant.color || ''}`;
  const item = items.find(i => i.key === key);
  return item ? item.quantity : 0;
}
