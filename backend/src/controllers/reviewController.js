const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');

/** Resolve a slug or ObjectId string to a product _id */
async function resolveProductId(slugOrId) {
  if (mongoose.Types.ObjectId.isValid(slugOrId)) return slugOrId;
  const product = await Product.findOne({ slug: slugOrId }).select('_id');
  return product ? product._id : null;
}

exports.getProductReviews = asyncHandler(async (req, res) => {
  const productId = await resolveProductId(req.params.productId);
  if (!productId) return res.json([]);
  const reviews = await Review.find({ product: productId, isApproved: true })
    .populate('user', 'name avatar').sort('-createdAt');
  res.json(reviews);
});

exports.createReview = asyncHandler(async (req, res) => {
  const productId = await resolveProductId(req.params.productId);
  if (!productId) { res.status(404); throw new Error('Product not found'); }

  const { rating, title, comment } = req.body;
  const existing = await Review.findOne({ product: productId, user: req.user._id });
  if (existing) return res.status(409).json({ message: 'You already reviewed this product' });

  const verifiedOrder = await Order.findOne({
    user: req.user._id,
    'items.product': productId,
    'payment.status': 'paid',
  });

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
  if (!review) { res.status(404); throw new Error('Review not found'); }
  const { rating, title, comment } = req.body;
  if (rating) review.rating = rating;
  if (title) review.title = title;
  if (comment) review.comment = comment;
  await review.save();
  const populated = await Review.findById(review._id).populate('user', 'name avatar');
  res.json(populated);
});

exports.deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!review) { res.status(404); throw new Error('Review not found'); }
  res.json({ message: 'Review deleted' });
});

exports.adminGetReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, approved } = req.query;
  const filter = {};
  if (approved !== undefined) filter.isApproved = approved === 'true';
  const [reviews, total] = await Promise.all([
    Review.find(filter).populate('user', 'name').populate('product', 'name').sort('-createdAt')
      .skip((page - 1) * limit).limit(Number(limit)),
    Review.countDocuments(filter),
  ]);
  res.json({ reviews, total, pages: Math.ceil(total / limit) });
});

exports.adminUpdateReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .populate('user', 'name').populate('product', 'name');
  if (!review) { res.status(404); throw new Error('Review not found'); }
  res.json(review);
});

exports.adminDeleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) { res.status(404); throw new Error('Review not found'); }
  res.json({ message: 'Review deleted' });
});
