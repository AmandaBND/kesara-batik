const mongoose = require('mongoose');

const refundRequestSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerName: String,
  customerEmail: String,
  amount: { type: Number, required: true },
  currency: { type: String, default: 'CAD' },
  reason: String,
  phoneNumber: String,
  accountNumber: String,
  bankName: String,
  accountHolderName: String,
  branch: String,
  notes: String,
  status: { type: String, enum: ['pending', 'paid', 'canceled'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('RefundRequest', refundRequestSchema);
