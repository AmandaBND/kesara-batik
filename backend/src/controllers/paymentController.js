const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');

// ═══════════════════════════════════════════════════════════
//  DIALOG GENIE BUSINESS — IPG (Internet Payment Gateway)
//  API Docs: https://geniebusiness.stoplight.io/
//  Support:  genie.integration@dialog.lk
//  Dashboard: https://dashboard.geniebiz.lk
// ═══════════════════════════════════════════════════════════

const GENIE_API_BASE = 'https://api.geniebiz.lk';

function genieHeaders() {
  return {
    'Content-Type':   'application/json',
    'Authorization':  `Bearer ${process.env.GENIE_API_SECRET}`,
    'Application-Id': process.env.GENIE_APP_ID,
  };
}

/** User-friendly error based on Genie HTTP status */
function genieErrorMessage(httpStatus) {
  if (httpStatus === 403) {
    return 'Genie payment is not yet active for this account. Please use Bank Transfer (HNB) to complete your order, or contact us on WhatsApp.';
  }
  if (httpStatus === 401) {
    return 'Genie payment credentials error. Please use Bank Transfer (HNB) to complete your order.';
  }
  if (httpStatus === 404) {
    return 'Genie payment service unavailable. Please use Bank Transfer (HNB) to complete your order.';
  }
  return 'Genie payment is temporarily unavailable. Please use Bank Transfer (HNB) to complete your order.';
}

/**
 * POST /api/payments/genie/create
 */
exports.createGeniePayment = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  if (!orderId) { res.status(400); throw new Error('orderId is required'); }

  if (!process.env.GENIE_API_SECRET || !process.env.GENIE_APP_ID) {
    res.status(500);
    throw new Error('Genie credentials not configured. Please use Bank Transfer instead.');
  }

  const order = await Order.findById(orderId).populate('user', 'name email');
  if (!order) { res.status(404); throw new Error('Order not found'); }

  const amountLKR    = Math.round(Number(order.pricing.total));
  const frontendUrl  = process.env.FRONTEND_URL || 'https://www.kesarabathik.com';
  const backendUrl   = process.env.BACKEND_URL  || 'https://kesara-batik-production.up.railway.app';

  const payload = {
    applicationId: process.env.GENIE_APP_ID,
    amount:        amountLKR,
    currency:      'LKR',
    title:         `Order #${order.orderNumber}`,
    description:   `Kesara Bathik — ${order.items.length} item(s)`,
    orderId:       order._id.toString(),
    callbackUrl:   `${backendUrl}/api/payments/genie/webhook`,
    returnUrl:     `${frontendUrl}/payment/genie/return?orderId=${order._id}`,
    cancelUrl:     `${frontendUrl}/payment/genie/return?status=failed&orderId=${order._id}`,
    customerEmail: order.shippingAddress?.email || order.guestEmail || order.user?.email || '',
    customerName:  order.shippingAddress?.fullName || order.user?.name || '',
  };

  console.log('[Genie] Creating charge → POST', GENIE_API_BASE + '/charge');

  let httpStatus  = 0;
  let responseBody = '';

  try {
    // ── Attempt 1: /charge ────────────────────────────────────
    const r1 = await fetch(`${GENIE_API_BASE}/charge`, {
      method:  'POST',
      headers: genieHeaders(),
      body:    JSON.stringify(payload),
    });
    httpStatus   = r1.status;
    responseBody = await r1.text();
    console.log(`[Genie] /charge → ${httpStatus}:`, responseBody.slice(0, 300));

    // ── Attempt 2: /v1/charge if first 404 ────────────────────
    if (!r1.ok && httpStatus === 404) {
      console.log('[Genie] Retrying → POST /v1/charge');
      const r2 = await fetch(`${GENIE_API_BASE}/v1/charge`, {
        method:  'POST',
        headers: genieHeaders(),
        body:    JSON.stringify(payload),
      });
      httpStatus   = r2.status;
      responseBody = await r2.text();
      console.log(`[Genie] /v1/charge → ${httpStatus}:`, responseBody.slice(0, 300));
    }

    if (httpStatus < 200 || httpStatus >= 300) {
      const msg = genieErrorMessage(httpStatus);
      console.error(`[Genie] Final error (${httpStatus}): ${responseBody.slice(0, 300)}`);
      res.status(502);
      throw new Error(msg);
    }

    const data       = JSON.parse(responseBody);
    const paymentUrl = data.paymentUrl || data.payment_url || data.url || data.checkoutUrl;

    if (!paymentUrl) {
      console.error('[Genie] No paymentUrl in response:', data);
      res.status(502);
      throw new Error('Genie returned OK but no payment URL. Please use Bank Transfer instead.');
    }

    await Order.findByIdAndUpdate(orderId, {
      'payment.transactionId': data.chargeId || data.charge_id || data.id || '',
      'payment.status':        'pending',
    });

    console.log('[Genie] ✅ Charge created:', data.chargeId || data.id, '→', paymentUrl);
    res.json({ paymentUrl, genieChargeId: data.chargeId || data.id });

  } catch (err) {
    if (res.headersSent) return;
    console.error('[Genie] Unhandled error:', err.message, '| HTTP:', httpStatus);
    res.status(502);
    throw new Error(genieErrorMessage(httpStatus) || 'Genie payment failed. Please use Bank Transfer instead.');
  }
});

/**
 * POST /api/payments/genie/webhook
 */
exports.genieWebhook = asyncHandler(async (req, res) => {
  res.json({ received: true });

  try {
    const body = req.body;
    console.log('[Genie Webhook] Received:', JSON.stringify(body));

    const referenceId = body.orderId || body.referenceId || body.order_id;
    const chargeId    = body.chargeId || body.charge_id || body.transactionId;
    const status      = body.status || body.paymentStatus || body.payment_status;

    if (!referenceId) {
      console.warn('[Genie Webhook] No referenceId found');
      return;
    }

    // Double-verify with Genie
    let verified = false;
    if (chargeId) {
      try {
        const check = await fetch(`${GENIE_API_BASE}/charge/${chargeId}`, { headers: genieHeaders() });
        if (check.ok) {
          const info = await check.json();
          const s = (info.status || '').toUpperCase();
          verified = ['SUCCESS', 'PAID', 'COMPLETED', 'CAPTURED'].includes(s);
          console.log('[Genie Webhook] Verified status:', s, verified ? '✅' : '❌');
        }
      } catch (e) {
        console.warn('[Genie Webhook] Verify call failed:', e.message);
      }
    }

    const isSuccess = verified ||
      ['SUCCESS', 'PAID', 'COMPLETED', 'CAPTURED'].includes((status || '').toUpperCase());

    if (isSuccess) {
      const updated = await Order.findByIdAndUpdate(referenceId, {
        'payment.status':        'paid',
        'payment.paidAt':        new Date(),
        'payment.transactionId': chargeId || '',
        status:                  'confirmed',
        $push: { statusHistory: { status: 'confirmed', note: 'Payment confirmed via Dialog Genie' } },
      }, { new: true }).populate('user', 'name email');

      if (updated) console.log('[Genie Webhook] ✅ Order confirmed:', updated.orderNumber);
    } else {
      await Order.findByIdAndUpdate(referenceId, {
        'payment.status': 'failed',
        status:           'cancelled',
        $push: { statusHistory: { status: 'cancelled', note: `Genie payment ${status}` } },
      });
      console.log('[Genie Webhook] ❌ Payment failed:', referenceId, status);
    }
  } catch (err) {
    console.error('[Genie Webhook] Error:', err.message);
  }
});

/**
 * GET /api/payments/genie/status/:orderId
 */
exports.getGeniePaymentStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId).select('status payment orderNumber');
  if (!order) { res.status(404); throw new Error('Order not found'); }
  res.json({
    status:        order.status,
    paymentStatus: order.payment.status,
    orderNumber:   order.orderNumber,
  });
});

/**
 * GET /api/payments/genie/ping  — diagnostic, remove after launch
 */
exports.pingGenie = asyncHandler(async (req, res) => {
  const info = {
    GENIE_APP_ID_SET:     !!process.env.GENIE_APP_ID,
    GENIE_API_SECRET_SET: !!process.env.GENIE_API_SECRET,
    GENIE_APP_ID_PREVIEW: (process.env.GENIE_APP_ID || '').slice(0, 8) + '...',
  };

  const testPayload = {
    applicationId: process.env.GENIE_APP_ID,
    amount: 1, currency: 'LKR', title: 'ping-test',
    callbackUrl: 'https://example.com/cb',
    returnUrl:   'https://example.com/ret',
    cancelUrl:   'https://example.com/cancel',
  };

  const attempts = [
    { label: 'Bearer JWT + Application-Id header',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.GENIE_API_SECRET}`, 'Application-Id': process.env.GENIE_APP_ID } },
    { label: 'Bearer JWT only',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.GENIE_API_SECRET}` } },
    { label: 'X-API-Key header',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': process.env.GENIE_API_SECRET, 'Application-Id': process.env.GENIE_APP_ID } },
    { label: 'apiKey in body', headers: { 'Content-Type': 'application/json' },
      extraBody: { apiKey: process.env.GENIE_API_SECRET } },
  ];

  info.attempts = [];
  for (const attempt of attempts) {
    try {
      const body = attempt.extraBody ? { ...testPayload, ...attempt.extraBody } : testPayload;
      const r = await fetch(`${GENIE_API_BASE}/charge`, {
        method: 'POST', headers: attempt.headers, body: JSON.stringify(body),
      });
      const text = (await r.text()).slice(0, 400);
      info.attempts.push({ label: attempt.label, status: r.status, body: text });
      if (r.status !== 401 && r.status !== 403) {
        info.working_auth = attempt.label;
        break;
      }
    } catch (e) {
      info.attempts.push({ label: attempt.label, error: e.message });
    }
  }

  res.json(info);
});
