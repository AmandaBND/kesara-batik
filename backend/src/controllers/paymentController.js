const asyncHandler = require('express-async-handler');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// POST /api/payments/stripe/intent
exports.createStripeIntent = asyncHandler(async (req, res) => {
  const { amount, currency = 'cad', orderId } = req.body;
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // cents
    currency,
    metadata: { orderId, userId: req.user?._id?.toString() || 'guest' },
    automatic_payment_methods: { enabled: true },
  });
  res.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
});

// POST /api/payments/stripe/webhook
exports.stripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ message: `Webhook error: ${err.message}` });
  }

  if (event.type === 'payment_intent.succeeded') {
    const Order = require('../models/Order');
    const pi = event.data.object;
    if (pi.metadata.orderId) {
      await Order.findByIdAndUpdate(pi.metadata.orderId, {
        'payment.status': 'paid',
        'payment.transactionId': pi.id,
        'payment.paidAt': new Date(),
        status: 'confirmed',
        $push: { statusHistory: { status: 'confirmed', note: 'Payment confirmed via Stripe' } },
      });
    }
  }

  res.json({ received: true });
});

// POST /api/payments/paypal/create
exports.createPaypalOrder = asyncHandler(async (req, res) => {
  const { amount, currency = 'CAD' } = req.body;
  const base = process.env.PAYPAL_MODE === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

  // Get access token
  const tokenRes = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  });
  const { access_token } = await tokenRes.json();

  // Create order
  const orderRes = await fetch(`${base}/v2/checkout/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${access_token}` },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{ amount: { currency_code: currency, value: amount.toFixed(2) } }],
    }),
  });
  const order = await orderRes.json();
  res.json({ id: order.id });
});

// POST /api/payments/paypal/capture
exports.capturePaypalOrder = asyncHandler(async (req, res) => {
  const { paypalOrderId, orderId } = req.body;
  const base = process.env.PAYPAL_MODE === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

  const tokenRes = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  });
  const { access_token } = await tokenRes.json();

  const captureRes = await fetch(`${base}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${access_token}` },
  });
  const capture = await captureRes.json();

  if (capture.status === 'COMPLETED' && orderId) {
    const Order = require('../models/Order');
    await Order.findByIdAndUpdate(orderId, {
      'payment.status': 'paid',
      'payment.paypalOrderId': paypalOrderId,
      'payment.transactionId': capture.id,
      'payment.paidAt': new Date(),
      status: 'confirmed',
      $push: { statusHistory: { status: 'confirmed', note: 'Payment confirmed via PayPal' } },
    });
  }

  res.json(capture);
});
