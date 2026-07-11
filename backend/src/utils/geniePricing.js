const { roundMoney } = require('./money');

/**
 * Resolve the amount/currency that must be sent to Dialog Genie.
 *
 * Business rules:
 * - Sri Lankan checkout remains exactly as before: charge the separately
 *   maintained LKR order total in LKR.
 * - Every overseas checkout keeps its selected display/order currency, but
 *   Genie is charged in CAD because CAD is the store's independent base
 *   currency and Product.price is stored in CAD.
 * - No overseas amount is ever converted through LKR.
 */
function resolveGenieCharge(pricing = {}) {
  const checkoutCurrency = String(pricing.currency || '').trim().toUpperCase();
  const checkoutAmount = Number(pricing.total);

  if (!checkoutCurrency) {
    throw new Error('Order currency is missing.');
  }
  if (!Number.isFinite(checkoutAmount) || checkoutAmount <= 0) {
    throw new Error('Order total is invalid.');
  }

  if (checkoutCurrency === 'LKR') {
    return {
      checkoutCurrency,
      checkoutAmount: roundMoney(checkoutAmount),
      gatewayCurrency: 'LKR',
      gatewayAmountMajor: roundMoney(checkoutAmount),
      usesCadBase: false,
    };
  }

  let totalCAD = Number(pricing.totalCAD);

  // Backward-compatible fallback for orders created before totalCAD was added.
  if ((!Number.isFinite(totalCAD) || totalCAD <= 0) && checkoutCurrency === 'CAD') {
    totalCAD = checkoutAmount;
  }

  if ((!Number.isFinite(totalCAD) || totalCAD <= 0)) {
    const exchangeRate = Number(pricing.exchangeRate);
    if (Number.isFinite(exchangeRate) && exchangeRate > 0) {
      totalCAD = checkoutAmount / exchangeRate;
    }
  }

  if (!Number.isFinite(totalCAD) || totalCAD <= 0) {
    throw new Error(
      'The CAD base total is missing for this order. Please create the order again before starting payment.',
    );
  }

  return {
    checkoutCurrency,
    checkoutAmount: roundMoney(checkoutAmount),
    gatewayCurrency: 'CAD',
    gatewayAmountMajor: roundMoney(totalCAD),
    usesCadBase: true,
  };
}

module.exports = { resolveGenieCharge };
