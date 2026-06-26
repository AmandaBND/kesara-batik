const asyncHandler = require("express-async-handler");
const Product = require("../models/Product");
const { cloudinary } = require("../config/cloudinary");

const BOOL_FIELDS = ["isFeatured", "isNewArrival", "isTrending", "isActive"];

function parseFormData(data) {
  if (typeof data.variants === "string") {
    try {
      data.variants = JSON.parse(data.variants);
    } catch {
      data.variants = [];
    }
  }
  if (typeof data.tags === "string") {
    data.tags = data.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }
  if (typeof data.metaKeywords === "string") {
    try {
      data.metaKeywords = JSON.parse(data.metaKeywords);
    } catch {
      data.metaKeywords = data.metaKeywords
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }
  }
  if (typeof data.additionalInfo === "string") {
    try {
      data.additionalInfo = JSON.parse(data.additionalInfo);
    } catch {
      data.additionalInfo = data.additionalInfo.trim();
    }
  }
  for (const key of BOOL_FIELDS) {
    if (data[key] === "true") data[key] = true;
    if (data[key] === "false") data[key] = false;
  }
  return data;
}

function sanitizeUpdateData(data) {
  const blocked = [
    "_id",
    "slug",
    "rating",
    "reviewCount",
    "soldCount",
    "createdAt",
    "updatedAt",
    "__v",
  ];
  blocked.forEach((k) => delete data[k]);
  if (!data.images) delete data.images;
  return data;
}

// GET /api/products
exports.getProducts = asyncHandler(async (req, res) => {
  const {
    category,
    parentCategory,
    search,
    sort,
    minPrice,
    maxPrice,
    page = 1,
    limit = 12,
    featured,
    newArrival,
    trending,
    showAll,
  } = req.query;
  const query = {};
  const includeInactive = showAll === "true" && req.user?.role === "admin";
  if (!includeInactive) query.isActive = true;

  if (category) query.category = category;
  if (parentCategory) query.parentCategory = parentCategory;
  if (featured === "true") query.isFeatured = true;
  if (newArrival === "true") query.isNewArrival = true;
  if (trending === "true") query.isTrending = true;
  if (minPrice || maxPrice)
    query.price = {
      ...(minPrice && { $gte: Number(minPrice) }),
      ...(maxPrice && { $lte: Number(maxPrice) }),
    };
  if (search) query.$text = { $search: search };

  const sortMap = {
    newest: "-createdAt",
    oldest: "createdAt",
    "price-asc": "price",
    "price-desc": "-price",
    popular: "-soldCount",
    rating: "-rating",
  };
  const sortBy = sortMap[sort] || "-createdAt";

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .sort(sortBy)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .select("-additionalInfo");

  res.json({
    products,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
  });
});

// GET /api/products/admin/:id (admin)
exports.getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
});

// GET /api/products/:slug
exports.getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    slug: req.params.slug,
    isActive: true,
  });
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
});

// POST /api/products (admin)
exports.createProduct = asyncHandler(async (req, res) => {
  try {
    console.log("[Product Create] Body:", JSON.stringify(req.body, null, 2));
    console.log("[Product Create] Files:", req.files?.length || 0);

    const data = parseFormData({ ...req.body });
    console.log("[Product Create] Parsed Data:", JSON.stringify(data, null, 2));

    if (req.files?.length) {
      console.log("[Product Create] Processing", req.files.length, "images...");
      data.images = req.files.map((f, i) => ({
        url: f.path,
        publicId: f.filename,
        alt: data.name,
        isPrimary: i === 0,
      }));
      console.log("[Product Create] Images mapped successfully");
    }

    console.log("[Product Create] Creating product in database...");
    const product = await Product.create(data);
    console.log("[Product Create] Product created with ID:", product._id);

    res.status(201).json(product);
  } catch (error) {
    console.error("[Product Create Error]", {
      message: error.message,
      code: error.code,
      errors: error.errors,
      stack: error.stack,
    });
    throw error;
  }
});

// PUT /api/products/:id (admin)
exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  const data = sanitizeUpdateData(parseFormData({ ...req.body }));

  // Handle new image uploads
  if (req.files?.length) {
    const newImages = req.files.map((f, i) => ({
      url: f.path,
      publicId: f.filename,
      alt: data.name || product.name,
      isPrimary: false,
    }));
    data.images = [...(product.images || []), ...newImages];
  }

  const updated = await Product.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true,
  });
  res.json(updated);
});

// DELETE /api/products/:id (admin)
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  // Remove images from Cloudinary
  for (const img of product.images || []) {
    if (img.publicId)
      await cloudinary.uploader.destroy(img.publicId).catch(() => {});
  }

  await product.deleteOne();
  res.json({ message: "Product deleted" });
});

// DELETE /api/products/:id/images/:imageId (admin)
exports.deleteProductImage = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  const img = product.images.id(req.params.imageId);
  if (img?.publicId)
    await cloudinary.uploader.destroy(img.publicId).catch(() => {});
  product.images = product.images.filter(
    (i) => i._id.toString() !== req.params.imageId,
  );
  await product.save();
  res.json(product);
});

// GET /api/products/categories/list
exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: "$parentCategory",
        subcategories: { $addToSet: "$category" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  res.json(categories);
});

// PATCH /api/products/:id/toggle (admin)
exports.toggleProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  product.isActive = !product.isActive;
  await product.save();
  res.json({ isActive: product.isActive });
});
