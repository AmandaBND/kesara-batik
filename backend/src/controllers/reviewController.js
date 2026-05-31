const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Order = require('../models/Order');

exports.getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId, isApproved: true })
    .populate('user', 'name avatar').sort('-createdAt');
  res.json(reviews);
});

exports.createReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { rating, title, comment } = req.body;

  const existing = await Review.findOne({ product: productId, user: req.user._id });
  if (existing) return res.status(409).json({ message: 'You already reviewed this product' });

  const verifiedOrder = await Order.findOne({ user: req.user._id, 'items.product': productId, 'payment.status': 'paid' });

  const review = await Review.create({
    product: productId, user: req.user._id, rating, title, comment,
    isVerifiedPurchase: !!verifiedOrder,
    order: verifiedOrder?._id,
  });
  const populated = await Review.findById(review._id).populate('user', 'name avatar');
  res.status(201).json(populated);
});

exports.updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findOne({ _id: req.params.id, user: req.user._id });
  if (!review) return res.status(404).json({ message: 'Review not found' });
  Object.assign(review, req.body);
  await review.save();
  res.json(review);
});

exports.deleteReview = asyncHandler(async (req, res) => {
  const query = req.user.role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, user: req.user._id };
  const review = await Review.findOneAndDelete(query);
  if (!review) return res.status(404).json({ message: 'Review not found' });
  res.json({ message: 'Review deleted' });
});

exports.adminReply = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(req.params.id, { adminReply: req.body.reply, adminReplyAt: new Date() }, { new: true });
  res.json(review);
});

exports.getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find().populate('user', 'name email').populate('product', 'name').sort('-createdAt');
  res.json(reviews);
});
