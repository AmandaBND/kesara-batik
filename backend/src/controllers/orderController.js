const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { findVariant, getAvailableStock, applyStockChangeForOrderItem } = require('../utils/stock');
const { canCancelOrder } = require('../utils/cancellation');
const { sendOrderInvoiceEmails, sendShippingUpdateEmail } = require('../services/emailService');
const RefundRequest = require('../models/RefundRequest');
const { getExchangeRates, DEFAULT_RATES } = require('../services/exchangeRateService');
const {
  normalizeCurrency,
  getProductUnitPrice,
  buildOrderPricing,
} = require('../utils/orderPricing');

// POST /api/orders
exports.createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, pricing, payment, notes } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error('Your cart is empty.');
  }

  if (!shippingAddress?.fullName || !shippingAddress?.email || !shippingAddress?.address || !shippingAddress?.city || !shippingAddress?.country) {
    res.status(400);
    throw new Error('Complete shipping address is required.');
  }

  if (!['genie', 'bank_transfer'].includes(payment?.method)) {
    res.status(400);
    throw new Error('Unsupported payment method.');
  }

  let currency;
  try {
    currency = normalizeCurrency(pricing?.currency);
  } catch (err) {
    res.status(400);
    throw err;
  }

  if (payment.method === 'genie' && currency !== 'LKR') {
    res.status(400);
    throw new Error('Dialog Genie is available only for LKR checkout.');
  }

  const exchangeRateDoc = currency === 'LKR' ? null : await getExchangeRates();
  const rates = {
    ...DEFAULT_RATES,
    ...(exchangeRateDoc?.rates?.toObject?.() || exchangeRateDoc?.rates || {}),
  };

  const aggregated = new Map();
  for (const item of items) {
    const quantity = Number(item.quantity);
    if (!item.product || !Number.isInteger(quantity) || quantity <= 0) {
      res.status(400);
      throw new Error('Each order item must have a valid product and quantity.');
    }

    const variant = item.variant || {};
    const aggKey = `${item.product}-${variant.size || ''}-${variant.color || ''}`;
    const existing = aggregated.get(aggKey);
    if (existing) existing.quantity += quantity;
    else aggregated.set(aggKey, { ...item, variant, quantity });
  }

  const productCache = new Map();
  const enrichedItems = [];
  let subtotal = 0;
  let subtotalCAD = 0;

  for (const item of aggregated.values()) {
    let product = productCache.get(item.product.toString());
    if (!product) {
      product = await Product.findById(item.product);
      if (!product || !product.isActive) {
        res.status(400);
        throw new Error(`Product ${item.product} is not available`);
      }
      productCache.set(item.product.toString(), product);
    }

    if (product.variants?.length) {
      const variant = findVariant(product, item.variant || {});
      if (!variant) {
        res.status(400);
        throw new Error(`${product.name}: selected size/color combination is unavailable`);
      }
    }

    const available = getAvailableStock(product, item.variant || {});
    if (item.quantity > available) {
      res.status(400);
      throw new Error(`${product.name}: only ${available} in stock for the selected variant`);
    }

    // Never trust item prices or totals sent by the browser. LKR uses the
    // product's manually configured priceLKR; foreign currencies use CAD rates.
    let unitPrice;
    try {
      unitPrice = getProductUnitPrice(product, currency, rates);
    } catch (err) {
      res.status(400);
      throw err;
    }
    const cadUnitPrice = Number(product.price) || 0;
    subtotal += unitPrice * item.quantity;
    subtotalCAD += cadUnitPrice * item.quantity;

    enrichedItems.push({
      product: item.product,
      quantity: item.quantity,
      variant: item.variant,
      name: product.name,
      image: product.images?.[0]?.url || '',
      price: unitPrice,
    });
  }

  let verifiedPricing;
  try {
    verifiedPricing = buildOrderPricing({
      subtotal,
      subtotalCAD,
      currency,
      rates,
    });
  } catch (err) {
    res.status(400);
    throw err;
  }

  const order = await Order.create({
    user: req.user?._id,
    guestEmail: req.user ? undefined : shippingAddress.email,
    items: enrichedItems,
    shippingAddress,
    pricing: verifiedPricing,
    payment: { method: payment.method, status: 'pending' },
    notes,
    statusHistory: [{ status: 'pending', note: 'Order placed' }],
  });

  const populated = await Order.findById(order._id).populate('user', 'name email');
  res.status(201).json(populated);

  // Fire-and-forget: email failures are logged inside emailService and never
  // affect the order itself or the response already sent to the customer.
  sendOrderInvoiceEmails(populated).catch((err) =>
    console.error('[email] order invoice dispatch failed:', err.message),
  );
});

// GET /api/orders/my
exports.getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort('-createdAt').populate('items.product', 'name images slug');
  res.json(orders);
});

// GET /api/orders/:id
exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email').populate('items.product', 'name images slug');
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.user?._id?.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  res.json(order);
});

// GET /api/orders (admin)
exports.getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20, search, from, to } = req.query;
  const query = {};
  if (status) query.status = status;
  if (search) query.$or = [{ orderNumber: new RegExp(search, 'i') }, { 'shippingAddress.fullName': new RegExp(search, 'i') }];
  if (from || to) query.createdAt = { ...(from && { $gte: new Date(from) }), ...(to && { $lte: new Date(to) }) };

  const total = await Order.countDocuments(query);
  const orders = await Order.find(query).sort('-createdAt').skip((page - 1) * limit).limit(Number(limit)).populate('user', 'name email');
  res.json({ orders, total, page: Number(page), pages: Math.ceil(total / limit) });
});

// PUT /api/orders/:id/status (admin)
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note, trackingNumber, courier } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  const previousStatus = order.status;
  order.status = status;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (courier) order.courier = courier;
  order.statusHistory.push({ status, note: note || `Status updated to ${status}`, updatedBy: req.user._id });

  await order.save();
  const populated = await Order.findById(order._id).populate('user', 'name email');
  res.json(populated);

  // Send shipping notification when status first moves to 'shipped'
  if (status === 'shipped' && previousStatus !== 'shipped') {
    sendShippingUpdateEmail(populated).catch(err =>
      console.error('[email] shipping update email failed:', err.message)
    );
  }
});

// POST /api/orders/:id/refund (admin)
exports.processRefund = asyncHandler(async (req, res) => {
  const { amount, reason } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.payment.status !== 'paid') return res.status(400).json({ message: 'Order not paid' });

  // In production: call Stripe/PayPal refund API
  order.payment.status = amount >= order.pricing.total ? 'refunded' : 'partial_refund';
  order.payment.refundedAt = new Date();
  order.payment.refundAmount = amount;
  order.payment.refundReason = reason;
  order.status = 'refunded';
  order.statusHistory.push({ status: 'refunded', note: `Refund of ${amount} ${order.pricing.currency}: ${reason}`, updatedBy: req.user._id });

  await order.save();
  res.json({ message: 'Refund processed', order });
});

// DELETE /api/orders/:id
exports.deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  for (const item of order.items || []) {
    const product = await Product.findById(item.product);
    if (!product) continue;
    applyStockChangeForOrderItem(product, item, { restore: true });
    await product.save();
  }

  await Order.findByIdAndDelete(req.params.id);
  res.json({ message: 'Order deleted and stock restored' });
});

exports.requestCancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  if (!canCancelOrder(order, new Date())) {
    return res.status(400).json({ message: 'Sorry, an order can cancel only within 1 day from order date.' });
  }

  const { reason, accountNumber, bankName, accountHolderName, branch, notes } = req.body;
  const refundRequest = await RefundRequest.create({
    order: order._id,
    user: req.user?._id,
    customerName: req.user?.name || order.shippingAddress?.fullName || 'Customer',
    customerEmail: req.user?.email || order.shippingAddress?.email || '',
    amount: order.pricing?.total || 0,
    currency: order.pricing?.currency || 'CAD',
    reason,
    accountNumber,
    bankName,
    accountHolderName,
    branch,
    notes,
    status: 'pending',
  });

  res.status(201).json(refundRequest);
});

exports.getRefundRequests = asyncHandler(async (req, res) => {
  const refunds = await RefundRequest.find().sort('-createdAt').populate('order', 'orderNumber createdAt pricing shippingAddress user');
  res.json(refunds);
});

exports.updateRefundRequest = asyncHandler(async (req, res) => {
  const refund = await RefundRequest.findById(req.params.id);
  if (!refund) return res.status(404).json({ message: 'Refund request not found' });

  const { status, notes } = req.body;
  refund.status = status;
  if (notes !== undefined) refund.notes = notes;
  if (status === 'paid') {
    const order = await Order.findById(refund.order);
    if (order?.items?.length) {
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (!product) continue;
        applyStockChangeForOrderItem(product, item, { restore: true });
        await product.save();
      }
    }
  }

  await refund.save();
  res.json(refund);
});
