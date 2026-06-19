export const LKR_SHIPPING = 450
export const CAD_FREE_SHIPPING_THRESHOLD = 120
export const CAD_SHIPPING = 18

export function getUnitPrice(product, currency, rates) {
  if (!product) return 0
  if (currency === 'LKR' && product.priceLKR != null && product.priceLKR > 0) {
    return product.priceLKR
  }
  const cadPrice = Number(product.price) || 0
  return cadPrice * (rates[currency] ?? 1)
}

export function getLineTotal(product, quantity, currency, rates) {
  return getUnitPrice(product, currency, rates) * quantity
}

export function getCartSubtotal(items, currency, rates) {
  return items.reduce(
    (sum, item) => sum + getLineTotal(item.product, item.quantity, currency, rates),
    0
  )
}

export function getShipping(items, currency, rates) {
  if (currency === 'LKR') return LKR_SHIPPING

  const subtotalCAD = getCartSubtotal(items, 'CAD', rates)
  if (subtotalCAD > CAD_FREE_SHIPPING_THRESHOLD) return 0
  return CAD_SHIPPING * (rates[currency] ?? 1)
}

export function getCartTotal(items, currency, rates) {
  return getCartSubtotal(items, currency, rates) + getShipping(items, currency, rates)
}

export function getSubtotalCAD(items) {
  return items.reduce((sum, item) => sum + (Number(item.product?.price) || 0) * item.quantity, 0)
}
