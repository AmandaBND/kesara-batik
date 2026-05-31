const express = require('express');
const r = express.Router();
const Product = require('../models/Product');

r.get('/', async (req, res) => {
  const cats = await Product.distinct('category', { isActive: true });
  const parents = await Product.distinct('parentCategory', { isActive: true });
  res.json({ categories: cats, parentCategories: parents.filter(Boolean) });
});

module.exports = r;
