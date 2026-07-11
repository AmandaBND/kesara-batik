/**
 * Convert a normal currency amount (for example LKR 8450.00) to the
 * smallest unit expected by payment gateways (845000 cents).
 *
 * Genie represents LKR amounts using two decimal places, so its API amount
 * must be sent as an integer number of cents.
 */
function toMinorUnits(amount, fractionDigits = 2) {
  const numericAmount = Number(amount);
  const digits = Number(fractionDigits);

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new TypeError('Payment amount must be a positive number.');
  }
  if (!Number.isInteger(digits) || digits < 0 || digits > 6) {
    throw new TypeError('fractionDigits must be an integer between 0 and 6.');
  }

  const multiplier = 10 ** digits;
  const minorUnits = Math.round((numericAmount + Number.EPSILON) * multiplier);

  if (!Number.isSafeInteger(minorUnits) || minorUnits <= 0) {
    throw new RangeError('Payment amount is outside the supported range.');
  }

  return minorUnits;
}

function roundMoney(amount, fractionDigits = 2) {
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount)) return 0;
  const multiplier = 10 ** fractionDigits;
  return Math.round((numericAmount + Number.EPSILON) * multiplier) / multiplier;
}

/**
 * ISO-style fraction digits used when an amount is sent to Genie.
 *
 * The existing LKR integration intentionally remains two-decimal, while JPY
 * and KRW are zero-decimal currencies. All other checkout currencies in this
 * project use two decimal places.
 */
function getCurrencyFractionDigits(currency) {
  const code = String(currency || '').trim().toUpperCase();
  return ['JPY', 'KRW'].includes(code) ? 0 : 2;
}

function toCurrencyMinorUnits(amount, currency) {
  return toMinorUnits(amount, getCurrencyFractionDigits(currency));
}

module.exports = {
  toMinorUnits,
  toCurrencyMinorUnits,
  getCurrencyFractionDigits,
  roundMoney,
};
