const SYMBOLS = {
  CAD: 'CA$',
  USD: 'US$',
  GBP: '£',
  AED: 'AED ',
  LKR: 'LKR ',
  JPY: '¥',
  KRW: '₩',
}

export function formatCurrencyAmount(amount, currency = 'CAD') {
  const code = String(currency || 'CAD').toUpperCase()
  const symbol = SYMBOLS[code] || `${code} `
  return `${symbol}${Number(amount || 0).toFixed(2)}`
}
