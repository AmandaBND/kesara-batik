const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: String,
  image: String,
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  variant: { size: String, color: String },
  sku: String,
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
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
      currency: { type: String, default: "CAD" },

      // Server-verified CAD snapshot for overseas payments. The normal
      // checkout currency/amount above remains unchanged for display,
      // invoices and order history. LKR never uses these CAD fields.
      baseCurrency: { type: String, default: "CAD" },
      subtotalCAD: Number,
      shippingCAD: Number,
      totalCAD: Number,
      exchangeRate: Number,

      // Overseas checkout remains in its selected currency, but this merchant
      // settles Genie transactions in LKR. These fields snapshot only that
      // final CAD -> LKR gateway conversion.
      cadToLkrRate: Number,
      gatewayTotalLKR: Number,
    },
    payment: {
      method: {
        type: String,
        enum: ["genie", "bank_transfer"],
        required: true,
      },
      status: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded", "partial_refund"],
        default: "pending",
      },
      transactionId: String,   // Genie orderId stored here
      genieOrderId: String,
      gatewayAmountMinor: Number,
      gatewayAmountMajor: Number,
      gatewayCurrency: String,
      gatewayExchangeRate: Number,
      gatewayBaseAmountCAD: Number,
      checkoutAmount: Number,
      checkoutCurrency: String,
      paidAt: Date,
      refundedAt: Date,
      refundAmount: Number,
      refundReason: String,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      default: "pending",
    },
    statusHistory: [
      {
        status: String,
        note: String,
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    trackingNumber: String,
    courier: String,
    estimatedDelivery: Date,
    notes: String,
    adminNotes: String,
    isReviewed: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Auto order number
orderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model("Order").countDocuments();
    this.orderNumber = "KB" + String(count + 1001).padStart(5, "0");
  }
  next();
});

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ "payment.status": 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);
