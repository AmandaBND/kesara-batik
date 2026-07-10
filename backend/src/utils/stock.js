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

function applyStockChangeForOrderItem(product, item = {}, options = {}) {
  if (!product) return;

  const quantity = Number(item?.quantity) || 0;
  if (!Number.isFinite(quantity) || quantity <= 0) return;

  const decrement = Boolean(options.decrement);
  const restore = Boolean(options.restore);

  if (product.variants?.length) {
    const variant = findVariant(product, item.variant || {});
    if (!variant) return;

    if (decrement) {
      variant.stock = Math.max(0, (variant.stock || 0) - quantity);
      product.stockCount = product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
    } else if (restore) {
      variant.stock = (variant.stock || 0) + quantity;
      product.stockCount = product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
    }
  } else if (decrement) {
    product.stockCount = Math.max(0, (product.stockCount || 0) - quantity);
  } else if (restore) {
    product.stockCount = (product.stockCount || 0) + quantity;
  }

  if (decrement) {
    product.soldCount = (product.soldCount || 0) + quantity;
  } else if (restore) {
    product.soldCount = Math.max(0, (product.soldCount || 0) - quantity);
  }
}

module.exports = { findVariant, getAvailableStock, applyStockChangeForOrderItem };
