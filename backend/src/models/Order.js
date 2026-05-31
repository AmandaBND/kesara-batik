const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  image: String,
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  variant: { size: String, color: String },
  sku: String,
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  guestEmail: String, // for guest checkout
  items: [orderItemSchema],
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: String,
    email: String,
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: String,
    postalCode: String,
    country: { type: String, required: true },
  },
  pricing: {
    subtotal: { type: Number, required: true },
    shipping: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    couponCode: String,
    total: { type: Number, required: true },
    currency: { type: String, default: 'CAD' },
  },
  payment: {
    method: { type: String, enum: ['stripe', 'paypal', 'google_pay', 'bank_transfer'], required: true },
    status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded', 'partial_refund'], default: 'pending' },
    transactionId: String,
    paypalOrderId: String,
    stripePaymentIntentId: String,
    paidAt: Date,
    refundedAt: Date,
    refundAmount: Number,
    refundReason: String,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending',
  },
  statusHistory: [{
    status: String,
    note: String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedAt: { type: Date, default: Date.now },
  }],
  trackingNumber: String,
  courier: String,
  estimatedDelivery: Date,
  notes: String,
  adminNotes: String,
  isReviewed: { type: Boolean, default: false },
}, { timestamps: true });

// Auto order number
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = 'KB' + String(count + 1001).padStart(5, '0');
  }
  next();
});

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
