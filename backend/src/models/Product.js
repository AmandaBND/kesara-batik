const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema({
  size: String,
  color: String,
  colorCode: String,
  stock: { type: Number, default: 0 },
  sku: String,
});

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: String,
  alt: String,
  isPrimary: { type: Boolean, default: false },
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    nameLocal: { type: String, trim: true }, // Sinhala name
    slug: { type: String, unique: true },
    sku: { type: String, unique: true, sparse: true },
    description: { type: String, required: true },
    shortDescription: String,
    price: { type: Number, required: true, min: 0 },
    comparePrice: { type: Number, min: 0 }, // strike-through price
    currency: { type: String, default: "CAD" },
    priceLKR: { type: Number, min: 0 }, // Manual LKR price (not exchange-based)
    category: {
      type: String,
      required: true,
      enum: [
        "Women's Saree",
        "Women's Lungi",
        "Batik Kandyan designs",
        "Batik Frocks",
        "Batik Tops & Skirts",
        "Batik Tops & Pants",
        "Batik Kurtha Sets",
        "Batik Kaftan",
        "Men's Avurudu Kits",
        "Men's Sarong",
        "Batik Shirts",
        "Kid's Focks",
        "Kid's Lama Saree",
        "Kids Shirts and Sarong",
        "Family Kits",
        "Bags",
        "Jewellery",
        "Clutches",
        "Slippers",
        "Hair Accessories",
        "Lungi",
        "Sarong/Lungi",
        "Unisex",
      ],
    },
    subCategory: String,
    parentCategory: {
      type: String,
      enum: ["Women", "Men", "Kids", "Family Kits", "Accessories", "Unisex"],
    },
    images: [imageSchema],
    variants: [variantSchema],
    fabric: String,
    length: String,
    width: String,
    care: String,
    additionalInfo: mongoose.Schema.Types.Mixed,
    tags: [String],
    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: true },
    isTrending: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    stockCount: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    weight: Number, // grams for shipping
    metaTitle: String,
    metaDescription: String,
    metaKeywords: [String],
  },
  { timestamps: true },
);

// Auto-generate slug
productSchema.pre("save", function (next) {
  if (this.isModified("name") || !this.slug) {
    this.slug =
      this.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim() +
      "-" +
      Date.now();
  }
  next();
});

productSchema.index({ name: "text", description: "text", tags: "text" });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ parentCategory: 1, isActive: 1 });

module.exports = mongoose.model("Product", productSchema);
