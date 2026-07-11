const { roundMoney } = require('./money');

/**
 * Resolve the amount/currency that must be sent to Dialog Genie.
 *
 * Business rules:
 * - Sri Lankan checkout remains exactly as before: charge the separately
 *   maintained LKR order total in LKR.
 * - Overseas checkout prices remain based on the independent CAD catalogue
 *   price and the selected CAD exchange rate. They are NOT recalculated from
 *   priceLKR.
 * - This merchant application is registered with Genie in LKR, so the final
 *   server-verified CAD base total is converted to LKR only for the gateway
 *   transaction. The customer's order currency and order total remain unchanged.
 */
function resolveGenieCharge(pricing = {}, options = {}) {
  const checkoutCurrency = String(pricing.currency || '').trim().toUpperCase();
  const checkoutAmount = Number(pricing.total);

  if (!checkoutCurrency) {
    throw new Error('Order currency is missing.');
  }
  if (!Number.isFinite(checkoutAmount) || checkoutAmount <= 0) {
    throw new Error('Order total is invalid.');
  }

  // Do not change the existing Sri Lankan payment path.
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

  // Backward-compatible fallback for old CAD orders created before totalCAD.
  if ((!Number.isFinite(totalCAD) || totalCAD <= 0) && checkoutCurrency === 'CAD') {
    totalCAD = checkoutAmount;
  }

  // Backward-compatible fallback for old foreign-currency orders.
  if (!Number.isFinite(totalCAD) || totalCAD <= 0) {
    const selectedCurrencyRate = Number(pricing.exchangeRate);
    if (Number.isFinite(selectedCurrencyRate) && selectedCurrencyRate > 0) {
      totalCAD = checkoutAmount / selectedCurrencyRate;
    }
  }

  if (!Number.isFinite(totalCAD) || totalCAD <= 0) {
    throw new Error(
      'The CAD base total is missing for this order. Please create the order again before starting payment.',
    );
  }

  // Prefer the exchange-rate snapshot saved when the order was created.
  // For older orders, paymentController supplies the latest server rate.
  const savedCadToLkrRate = Number(pricing.cadToLkrRate);
  const fallbackCadToLkrRate = Number(options.cadToLkrRate);
  const cadToLkrRate = Number.isFinite(savedCadToLkrRate) && savedCadToLkrRate > 0
    ? savedCadToLkrRate
    : fallbackCadToLkrRate;

  if (!Number.isFinite(cadToLkrRate) || cadToLkrRate <= 0) {
    throw new Error('The CAD to LKR gateway exchange rate is unavailable. Please try again.');
  }

  const savedGatewayTotalLKR = Number(pricing.gatewayTotalLKR);
  const gatewayAmountMajor = Number.isFinite(savedGatewayTotalLKR) && savedGatewayTotalLKR > 0
    ? roundMoney(savedGatewayTotalLKR)
    : roundMoney(totalCAD * cadToLkrRate);

  if (!Number.isFinite(gatewayAmountMajor) || gatewayAmountMajor <= 0) {
    throw new Error('The LKR gateway amount could not be calculated. Please try again.');
  }

  return {
    checkoutCurrency,
    checkoutAmount: roundMoney(checkoutAmount),
    gatewayCurrency: 'LKR',
    gatewayAmountMajor,
    usesCadBase: true,
    convertedCadToLkrForGateway: true,
    cadBaseAmount: roundMoney(totalCAD),
    gatewayExchangeRate: cadToLkrRate,
  };
}

module.exports = { resolveGenieCharge };
