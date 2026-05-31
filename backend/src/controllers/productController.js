const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const { cloudinary } = require('../config/cloudinary');

// GET /api/products
exports.getProducts = asyncHandler(async (req, res) => {
  const { category, parentCategory, search, sort, minPrice, maxPrice, page = 1, limit = 12, featured, newArrival, trending } = req.query;
  const query = { isActive: true };

  if (category) query.category = category;
  if (parentCategory) query.parentCategory = parentCategory;
  if (featured === 'true') query.isFeatured = true;
  if (newArrival === 'true') query.isNewArrival = true;
  if (trending === 'true') query.isTrending = true;
  if (minPrice || maxPrice) query.price = { ...(minPrice && { $gte: Number(minPrice) }), ...(maxPrice && { $lte: Number(maxPrice) }) };
  if (search) query.$text = { $search: search };

  const sortMap = { newest: '-createdAt', oldest: 'createdAt', 'price-asc': 'price', 'price-desc': '-price', popular: '-soldCount', rating: '-rating' };
  const sortBy = sortMap[sort] || '-createdAt';

  const total = await Product.countDocuments(query);
  const products = await Product.find(query).sort(sortBy).skip((page - 1) * limit).limit(Number(limit)).select('-additionalInfo');

  res.json({ products, total, page: Number(page), pages: Math.ceil(total / limit) });
});

// GET /api/products/:slug
exports.getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

// POST /api/products (admin)
exports.createProduct = asyncHandler(async (req, res) => {
  const data = req.body;
  if (req.files?.length) {
    data.images = req.files.map((f, i) => ({ url: f.path, publicId: f.filename, alt: data.name, isPrimary: i === 0 }));
  }
  const product = await Product.create(data);
  res.status(201).json(product);
});

// PUT /api/products/:id (admin)
exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const data = { ...req.body };

  // Handle new image uploads
  if (req.files?.length) {
    const newImages = req.files.map((f, i) => ({ url: f.path, publicId: f.filename, alt: data.name || product.name, isPrimary: false }));
    data.images = [...(product.images || []), ...newImages];
  }

  // Parse JSON fields from form
  if (typeof data.variants === 'string') data.variants = JSON.parse(data.variants);
  if (typeof data.tags === 'string') data.tags = JSON.parse(data.tags);
  if (typeof data.metaKeywords === 'string') data.metaKeywords = JSON.parse(data.metaKeywords);

  const updated = await Product.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
  res.json(updated);
});

// DELETE /api/products/:id (admin)
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  // Remove images from Cloudinary
  for (const img of product.images || []) {
    if (img.publicId) await cloudinary.uploader.destroy(img.publicId).catch(() => {});
  }

  await product.deleteOne();
  res.json({ message: 'Product deleted' });
});

// DELETE /api/products/:id/images/:imageId (admin)
exports.deleteProductImage = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  const img = product.images.id(req.params.imageId);
  if (img?.publicId) await cloudinary.uploader.destroy(img.publicId).catch(() => {});
  product.images = product.images.filter(i => i._id.toString() !== req.params.imageId);
  await product.save();
  res.json(product);
});

// GET /api/products/categories/list
exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$parentCategory', subcategories: { $addToSet: '$category' }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  res.json(categories);
});

// PATCH /api/products/:id/toggle (admin)
exports.toggleProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  product.isActive = !product.isActive;
  await product.save();
  res.json({ isActive: product.isActive });
});
