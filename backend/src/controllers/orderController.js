const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');

// POST /api/orders
exports.createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, pricing, payment, notes } = req.body;

  // Validate stock and enrich items
  const enrichedItems = await Promise.all(items.map(async (item) => {
    const product = await Product.findById(item.product);
    if (!product || !product.isActive) throw new Error(`Product ${item.product} not available`);
    return { ...item, name: product.name, image: product.images?.[0]?.url || '' };
  }));

  const order = await Order.create({
    user: req.user?._id,
    guestEmail: req.user ? undefined : shippingAddress.email,
    items: enrichedItems,
    shippingAddress,
    pricing,
    payment,
    notes,
    statusHistory: [{ status: 'pending', note: 'Order placed' }],
  });

  // Update sold count
  for (const item of items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { soldCount: item.quantity } });
  }

  const populated = await Order.findById(order._id).populate('user', 'name email');
  res.status(201).json(populated);
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

  order.status = status;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (courier) order.courier = courier;
  order.statusHistory.push({ status, note: note || `Status updated to ${status}`, updatedBy: req.user._id });

  await order.save();
  res.json(order);
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
  order.statusHistory.push({ status: 'refunded', note: `Refund of ${amount} CAD: ${reason}`, updatedBy: req.user._id });

  await order.save();
  res.json({ message: 'Refund processed', order });
});
