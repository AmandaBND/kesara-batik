const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { toCurrencyMinorUnits } = require('../utils/money');
const {
  normalizeCurrency,
  SUPPORTED_CURRENCIES,
} = require('../utils/orderPricing');
const { resolveGenieCharge } = require('../utils/geniePricing');
const { applyStockChangeForOrderItem } = require('../utils/stock');

// ═══════════════════════════════════════════════════════════
//  DIALOG GENIE BUSINESS — Transaction API V2
//  Docs: https://geniebusiness.stoplight.io/
// ═══════════════════════════════════════════════════════════

const GENIE_APP_VERSION = 'geniebiz-connect-js';
const GENIE_API_VERSION = '2.0';
const GENIE_SIGN_METHOD = 'sha1';

function getGenieApiKey() {
  // Keep GENIE_API_SECRET support because this project already uses that name.
  return (process.env.GENIE_APP_KEY || process.env.GENIE_API_SECRET || '').trim();
}

function getGenieBaseUrl() {
  const explicit = (process.env.GENIE_API_BASE || '').trim().replace(/\/$/, '');
  if (explicit) return explicit;

  const mode = (process.env.GENIE_MODE || process.env.GENIE_ENV || 'production').toLowerCase();
  if (mode === 'sandbox' || mode === 'uat' || mode === 'test') {
    return 'https://api.uat.geniebiz.lk/public';
  }
  return 'https://api.geniebiz.lk/public';
}

function cleanUrl(value, fallback) {
  return String(value || fallback || '').trim().replace(/\/$/, '');
}

function genieHeaders() {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    // Genie uses the App Key directly here. Do not prefix with Bearer.
    Authorization: getGenieApiKey(),
  };
}

function buildSignature(amount, currency) {
  const apiKey = getGenieApiKey();
  const source = `amount=${amount}&currency=${currency}&apiKey=${apiKey}`;
  return crypto.createHash('sha1').update(source).digest('hex');
}

function expiryIso(hours = 24) {
  const d = new Date(Date.now() + Number(hours || 24) * 60 * 60 * 1000);
  // Genie examples use UTC ISO with microseconds: 2026-07-05T10:00:00.000000Z
  return d.toISOString().replace('Z', '000Z');
}

function safeJsonParse(text) {
  try { return text ? JSON.parse(text) : {}; } catch { return { raw: text }; }
}

function findPaymentUrl(data) {
  if (!data || typeof data !== 'object') return '';

  const direct = [
    data.paymentUrl,
    data.paymentURL,
    data.payment_url,
    data.paymentPortalUrl,
    data.paymentPortalURL,
    data.payment_portal_url,
    data.checkoutUrl,
    data.checkoutURL,
    data.checkout_url,
    data.url,
    data?.payment?.url,
    data?.payment?.paymentUrl,
    data?.transaction?.paymentUrl,
    data?.transaction?.paymentPortalUrl,
    data?.data?.paymentUrl,
    data?.data?.paymentPortalUrl,
    data?.data?.url,
  ].find(v => typeof v === 'string' && /^https?:\/\//i.test(v));

  if (direct) return direct;

  const stack = [data];
  while (stack.length) {
    const obj = stack.pop();
    if (!obj || typeof obj !== 'object') continue;

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string' && /^https?:\/\//i.test(value)) {
        const k = key.toLowerCase();
        if ((k.includes('payment') || k.includes('portal') || k.includes('checkout') || k.includes('link')) &&
            !k.includes('redirect') && !k.includes('webhook')) {
          return value;
        }
      } else if (value && typeof value === 'object') {
        stack.push(value);
      }
    }
  }

  return '';
}

function findTransactionId(data) {
  if (!data || typeof data !== 'object') return '';
  return String(
    data.transactionId ||
    data.transaction_id ||
    data.id ||
    data._id ||
    data?.transaction?.transactionId ||
    data?.transaction?.id ||
    data?.data?.transactionId ||
    data?.data?.id ||
    ''
  );
}

function normalizeStatus(value) {
  return String(value || '').trim().toUpperCase();
}

function findStatus(data) {
  if (!data || typeof data !== 'object') return '';
  return normalizeStatus(
    data.status ||
    data.paymentStatus ||
    data.payment_status ||
    data.state ||
    data.transactionStatus ||
    data?.transaction?.status ||
    data?.payment?.status ||
    data?.data?.status ||
    ''
  );
}

function findCurrency(data) {
  if (!data || typeof data !== 'object') return '';
  return String(
    data.currency ||
    data.paymentCurrency ||
    data.payment_currency ||
    data?.transaction?.currency ||
    data?.payment?.currency ||
    data?.data?.currency ||
    ''
  ).trim().toUpperCase();
}

function findAmountMinor(data) {
  if (!data || typeof data !== 'object') return null;
  const raw =
    data.amount ??
    data.paymentAmount ??
    data.payment_amount ??
    data?.transaction?.amount ??
    data?.payment?.amount ??
    data?.data?.amount;

  if (raw === undefined || raw === null || raw === '') return null;
  const amount = Number(raw);
  return Number.isSafeInteger(amount) && amount > 0 ? amount : null;
}

function isSuccessStatus(status) {
  return ['SUCCESS', 'SUCCEEDED', 'PAID', 'COMPLETED', 'CONFIRMED', 'CAPTURED', 'APPROVED'].includes(normalizeStatus(status));
}

function isFailedStatus(status) {
  return ['FAILED', 'FAILURE', 'CANCELLED', 'CANCELED', 'EXPIRED', 'REJECTED', 'DECLINED'].includes(normalizeStatus(status));
}

function genieErrorMessage(httpStatus, bodyText = '') {
  const lower = String(bodyText || '').toLowerCase();

  if (httpStatus === 401 || httpStatus === 403) {
    return 'Genie payment credentials/app access error. Check the API key, approved domain, production status and merchant application permissions.';
  }
  if (httpStatus === 404) {
    return 'Genie Transaction API endpoint not found. Check GENIE_API_BASE and use the /public/transactions endpoint.';
  }
  if (
    lower.includes('currency') ||
    lower.includes('dcc') ||
    lower.includes('multi currency') ||
    lower.includes('multi-currency') ||
    lower.includes('merchant currency')
  ) {
    return 'Genie rejected the CAD payment currency for this merchant application. LKR remains unchanged, but overseas payments require CAD / Multi-Currency Pricing to be enabled on the Dialog Pay Business merchant account.';
  }
  if (httpStatus >= 500) {
    return 'Genie payment service is temporarily unavailable. Please use Bank Transfer (HNB) to complete your order.';
  }
  if (bodyText) return `Genie payment failed: ${bodyText.slice(0, 160)}`;
  return 'Genie payment is temporarily unavailable. Please use Bank Transfer (HNB) to complete your order.';
}

function getBillingDetails(order) {
  const a = order.shippingAddress || {};
  const email = a.email || order.guestEmail || order.user?.email || 'customer@kesarabathik.com';
  const name = a.fullName || order.user?.name || 'Kesara Bathik Customer';
  const address1 = a.address || `${a.city || 'Sri Lanka'}`;
  const address2 = [a.city, a.state, a.postalCode, a.country].filter(Boolean).join(', ');

  return {
    email,
    name,
    address1,
    ...(address2 ? { address2 } : {}),
  };
}

async function fetchGenieTransaction(transactionId) {
  if (!transactionId) return null;
  const url = `${getGenieBaseUrl()}/transactions/${encodeURIComponent(transactionId)}`;
  const response = await fetch(url, { method: 'GET', headers: genieHeaders() });
  const text = await response.text();
  const data = safeJsonParse(text);

  if (!response.ok) {
    console.warn(`[Genie] Get transaction failed ${response.status}:`, text.slice(0, 300));
    return null;
  }

  return data;
}

async function updateOrderFromGenieStatus(order, transactionData) {
  const status = findStatus(transactionData);
  const transactionId = findTransactionId(transactionData) || order.payment?.transactionId || '';

  if (isSuccessStatus(status)) {
    const gatewayCurrency = findCurrency(transactionData);
    const gatewayAmountMinor = findAmountMinor(transactionData);
    const expectedCurrency = String(order.payment?.gatewayCurrency || '').toUpperCase();
    const expectedAmountMinor = Number(order.payment?.gatewayAmountMinor || 0);

    // A successful status is accepted only for the exact payment session that
    // was created for this order. Some Genie responses omit these fields, so
    // compare them only when the gateway sends them back.
    if (gatewayCurrency && expectedCurrency && gatewayCurrency !== expectedCurrency) {
      console.error('[Genie] Currency mismatch:', {
        orderId: order._id,
        expectedCurrency,
        gatewayCurrency,
      });
      return order;
    }

    if (gatewayAmountMinor && expectedAmountMinor && gatewayAmountMinor !== expectedAmountMinor) {
      console.error('[Genie] Amount mismatch:', {
        orderId: order._id,
        expectedAmountMinor,
        gatewayAmountMinor,
      });
      return order;
    }

    // Atomic pending/failed -> paid transition prevents webhook and polling
    // from reducing stock more than once for the same payment.
    const updated = await Order.findOneAndUpdate({
      _id: order._id,
      'payment.status': { $ne: 'paid' },
    }, {
      'payment.status': 'paid',
      'payment.paidAt': new Date(),
      'payment.transactionId': transactionId,
      'payment.genieOrderId': transactionId,
      status: 'confirmed',
      $push: { statusHistory: { status: 'confirmed', note: `Payment confirmed via Dialog Genie (${status})` } },
    }, { new: true }).select('status payment orderNumber items');

    if (!updated) {
      return Order.findById(order._id).select('status payment orderNumber items');
    }

    if (updated?.items?.length) {
      for (const item of updated.items) {
        const product = await Product.findById(item.product);
        if (!product) continue;
        applyStockChangeForOrderItem(product, item, { decrement: true });
        await product.save();
      }
    }

    return updated;
  }

  if (isFailedStatus(status)) {
    const updated = await Order.findByIdAndUpdate(order._id, {
      'payment.status': 'failed',
      status: 'cancelled',
      $push: { statusHistory: { status: 'cancelled', note: `Genie payment ${status}` } },
    }, { new: true }).select('status payment orderNumber');
    return updated;
  }

  return order;
}

/**
 * POST /api/payments/genie/create
 */
exports.createGeniePayment = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  if (!orderId) { res.status(400); throw new Error('orderId is required'); }

  const apiKey = getGenieApiKey();
  if (!apiKey) {
    res.status(500);
    throw new Error('Genie API key is not configured. Set GENIE_APP_KEY or GENIE_API_SECRET in Railway.');
  }

  const order = await Order.findById(orderId).populate('user', 'name email');
  if (!order) { res.status(404); throw new Error('Order not found'); }

  if (order.payment?.status === 'paid') {
    res.status(400);
    throw new Error('This order is already paid.');
  }

  let checkoutCurrency;
  try {
    checkoutCurrency = normalizeCurrency(order.pricing?.currency || 'CAD');
  } catch (err) {
    res.status(400);
    throw err;
  }

  if (!SUPPORTED_CURRENCIES.has(checkoutCurrency)) {
    res.status(400);
    throw new Error(`Dialog Genie is not configured for ${checkoutCurrency}.`);
  }

  // IMPORTANT — keep the two price systems separate:
  // - LKR checkout: charge the existing manually maintained LKR total in LKR.
  // - Overseas checkout: preserve the selected display/order currency, but
  //   charge Genie in CAD using the server-saved CAD base total. This avoids
  //   sending unsupported site currencies such as AED, JPY or KRW to Genie
  //   and never converts an overseas order through LKR.
  let genieCharge;
  try {
    genieCharge = resolveGenieCharge(order.pricing || {});
  } catch (err) {
    res.status(400);
    throw err;
  }

  const amountMajor = genieCharge.gatewayAmountMajor;
  const gatewayCurrency = genieCharge.gatewayCurrency;
  let amountMinor;
  try {
    amountMinor = toCurrencyMinorUnits(amountMajor, gatewayCurrency);
  } catch {
    res.status(400);
    throw new Error('Invalid order amount for Genie payment.');
  }

  const frontendUrl = cleanUrl(process.env.FRONTEND_URL, 'https://www.kesarabathik.com');
  const backendUrl = cleanUrl(process.env.BACKEND_URL, 'https://kesara-batik-production.up.railway.app');

  const payload = {
    amount: amountMinor,
    currency: gatewayCurrency,
    redirectUrl: `${frontendUrl}/payment/genie/return?orderId=${order._id}`,
    webhook: `${backendUrl}/api/payments/genie/webhook`,
    localId: order._id.toString(),
    customerReference: order.orderNumber || order._id.toString(),
    billingDetails: getBillingDetails(order),
    expires: expiryIso(24),
    signature: buildSignature(amountMinor, gatewayCurrency),
    apiVersion: GENIE_API_VERSION,
    appVersion: GENIE_APP_VERSION,
    signMethod: GENIE_SIGN_METHOD,
  };

  const endpoint = `${getGenieBaseUrl()}/transactions`;
  console.log('[Genie] Creating transaction → POST', endpoint);
  console.log('[Genie] Payload preview:', {
    checkoutAmount: genieCharge.checkoutAmount,
    checkoutCurrency: genieCharge.checkoutCurrency,
    gatewayAmountMajor: amountMajor,
    gatewayAmountMinor: payload.amount,
    gatewayCurrency: payload.currency,
    usesCadBase: genieCharge.usesCadBase,
    localId: payload.localId,
    customerReference: payload.customerReference,
    redirectUrl: payload.redirectUrl,
    webhook: payload.webhook,
    billingEmail: payload.billingDetails.email,
  });

  let httpStatus = 0;
  let responseText = '';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: genieHeaders(),
      body: JSON.stringify(payload),
    });

    httpStatus = response.status;
    responseText = await response.text();
    const data = safeJsonParse(responseText);
    console.log(`[Genie] /transactions → ${httpStatus}:`, responseText.slice(0, 500));

    if (!response.ok) {
      res.status(502);
      throw new Error(genieErrorMessage(httpStatus, responseText));
    }

    const paymentUrl = findPaymentUrl(data);
    const transactionId = findTransactionId(data);

    if (!paymentUrl) {
      console.error('[Genie] Transaction response has no payment URL:', data);
      res.status(502);
      throw new Error('Genie created a transaction but did not return a payment URL. Check the response in Railway logs.');
    }

    await Order.findByIdAndUpdate(orderId, {
      'payment.transactionId': transactionId,
      'payment.genieOrderId': transactionId,
      'payment.status': 'pending',
      'payment.gatewayAmountMinor': amountMinor,
      'payment.gatewayCurrency': gatewayCurrency,
      'payment.checkoutAmount': genieCharge.checkoutAmount,
      'payment.checkoutCurrency': genieCharge.checkoutCurrency,
    });

    console.log('[Genie] ✅ Transaction created:', transactionId || '(no id)', '→', paymentUrl);
    res.json({
      paymentUrl,
      transactionId,
      gatewayCurrency,
      gatewayAmount: amountMajor,
      checkoutCurrency: genieCharge.checkoutCurrency,
      checkoutAmount: genieCharge.checkoutAmount,
    });
  } catch (err) {
    if (res.headersSent) return;
    console.error('[Genie] Error:', err.message, '| HTTP:', httpStatus, '| Body:', responseText.slice(0, 300));
    res.status(502);
    throw new Error(err.message || genieErrorMessage(httpStatus, responseText));
  }
});

/**
 * POST /api/payments/genie/webhook
 */
exports.genieWebhook = asyncHandler(async (req, res) => {
  res.json({ received: true });

  try {
    const body = req.body || {};
    console.log('[Genie Webhook] Received:', JSON.stringify(body));

    const localId = body.localId || body.local_id || body.orderId || body.order_id || body.referenceId || body.customerReference;
    const transactionId = body.transactionId || body.transaction_id || body.id || body._id || body?.transaction?.id || body?.data?.id;

    if (!localId && !transactionId) {
      console.warn('[Genie Webhook] No localId/orderId or transactionId found');
      return;
    }

    let order = null;
    if (localId) order = await Order.findById(localId).select('status payment orderNumber');
    if (!order && transactionId) order = await Order.findOne({ 'payment.transactionId': transactionId }).select('status payment orderNumber');
    if (!order) {
      console.warn('[Genie Webhook] Order not found for:', { localId, transactionId });
      return;
    }

    let transactionData = body;
    if (transactionId) {
      const verified = await fetchGenieTransaction(transactionId);
      if (verified) transactionData = verified;
    }

    const updated = await updateOrderFromGenieStatus(order, transactionData);
    console.log('[Genie Webhook] Order status:', updated.orderNumber, updated.payment?.status, updated.status);
  } catch (err) {
    console.error('[Genie Webhook] Error:', err.message);
  }
});

/**
 * GET /api/payments/genie/status/:orderId
 */
exports.getGeniePaymentStatus = asyncHandler(async (req, res) => {
  let order = await Order.findById(req.params.orderId).select('status payment orderNumber');
  if (!order) { res.status(404); throw new Error('Order not found'); }

  if (order.payment?.status === 'pending' && order.payment?.transactionId) {
    const transactionData = await fetchGenieTransaction(order.payment.transactionId);
    if (transactionData) {
      order = await updateOrderFromGenieStatus(order, transactionData);
    }
  }

  res.json({
    status: order.status,
    paymentStatus: order.payment.status,
    orderNumber: order.orderNumber,
    transactionId: order.payment.transactionId || '',
  });
});

/**
 * GET /api/payments/genie/ping — safe diagnostic, does not create a transaction
 */
exports.pingGenie = asyncHandler(async (req, res) => {
  const baseUrl = getGenieBaseUrl();
  const apiKey = getGenieApiKey();

  res.json({
    GENIE_APP_ID_SET: !!process.env.GENIE_APP_ID,
    GENIE_APP_KEY_SET: !!apiKey,
    GENIE_APP_ID_PREVIEW: process.env.GENIE_APP_ID ? `${process.env.GENIE_APP_ID.slice(0, 8)}...` : '',
    GENIE_APP_KEY_PREVIEW: apiKey ? `${apiKey.slice(0, 12)}...` : '',
    GENIE_MODE: process.env.GENIE_MODE || process.env.GENIE_ENV || 'production',
    GENIE_BASE_URL: baseUrl,
    CREATE_TRANSACTION_ENDPOINT: `${baseUrl}/transactions`,
    GET_TRANSACTION_ENDPOINT: `${baseUrl}/transactions/{transactionId}`,
    AUTH_STYLE: 'Authorization header contains the Genie App Key directly. No Bearer prefix.',
    SUPPORTED_CHECKOUT_CURRENCIES: Array.from(SUPPORTED_CURRENCIES),
    PAYMENT_CURRENCY_RULE: 'LKR checkout -> LKR. Every overseas checkout -> CAD base total. No overseas payment is converted through LKR.',
    AMOUNT_FORMAT: 'Integer smallest unit. LKR 8450.00 -> 845000; CAD 52.74 -> 5274.',
    MCP_NOTE: 'The Genie merchant application must be enabled for CAD/Multi-Currency Pricing (Tourism Plan) for overseas payments.',
    SIGNATURE_FORMULA: 'sha1("amount=" + minorUnitAmount + "&currency=" + gatewayCurrency + "&apiKey=" + appKey)',
  });
});
