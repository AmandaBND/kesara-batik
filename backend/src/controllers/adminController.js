const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// GET /api/admin/dashboard
exports.getDashboard = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalRevenue, monthRevenue, lastMonthRevenue,
    totalOrders, pendingOrders, totalUsers,
    totalProducts, recentOrders, topProducts,
    revenueByMonth, ordersByStatus
  ] = await Promise.all([
    Order.aggregate([{ $match: { 'payment.status': 'paid' } }, { $group: { _id: null, total: { $sum: '$pricing.total' } } }]),
    Order.aggregate([{ $match: { 'payment.status': 'paid', createdAt: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: '$pricing.total' } } }]),
    Order.aggregate([{ $match: { 'payment.status': 'paid', createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } }, { $group: { _id: null, total: { $sum: '$pricing.total' } } }]),
    Order.countDocuments(),
    Order.countDocuments({ status: 'pending' }),
    User.countDocuments({ role: 'user' }),
    Product.countDocuments({ isActive: true }),
    Order.find().sort('-createdAt').limit(10).populate('user', 'name email'),
    Product.find({ isActive: true }).sort('-soldCount').limit(5).select('name images price soldCount rating'),
    Order.aggregate([
      { $match: { 'payment.status': 'paid', createdAt: { $gte: new Date(now.getFullYear(), 0, 1) } } },
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, revenue: { $sum: '$pricing.total' }, orders: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);

  const currMonth = monthRevenue[0]?.total || 0;
  const prevMonth = lastMonthRevenue[0]?.total || 0;
  const growth = prevMonth > 0 ? (((currMonth - prevMonth) / prevMonth) * 100).toFixed(1) : 0;

  res.json({
    stats: {
      totalRevenue: totalRevenue[0]?.total || 0,
      monthRevenue: currMonth,
      revenueGrowth: growth,
      totalOrders,
      pendingOrders,
      totalUsers,
      totalProducts,
    },
    recentOrders,
    topProducts,
    revenueByMonth,
    ordersByStatus,
  });
});

// GET /api/admin/users
exports.getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const query = {};
  if (search) query.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
  const total = await User.countDocuments(query);
  const users = await User.find(query).sort('-createdAt').skip((page - 1) * limit).limit(Number(limit)).select('-password');
  res.json({ users, total });
});

// PATCH /api/admin/users/:id
exports.updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});
