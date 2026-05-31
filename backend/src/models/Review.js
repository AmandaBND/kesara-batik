const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: String,
  comment: { type: String, required: true, minlength: 10, maxlength: 1000 },
  images: [String],
  isVerifiedPurchase: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: true },
  helpfulVotes: { type: Number, default: 0 },
  adminReply: String,
  adminReplyAt: Date,
}, { timestamps: true });

reviewSchema.index({ product: 1, user: 1 }, { unique: true });
reviewSchema.index({ product: 1, isApproved: 1 });

// Update product rating after review save
reviewSchema.post('save', async function () {
  const Product = mongoose.model('Product');
  const stats = await mongoose.model('Review').aggregate([
    { $match: { product: this.product, isApproved: true } },
    { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(this.product, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      reviewCount: stats[0].count,
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema);
