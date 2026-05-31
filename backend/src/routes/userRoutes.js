// userRoutes.js
const express = require('express');
const r = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

r.post('/wishlist/:productId', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  const idx = user.wishlist.indexOf(req.params.productId);
  if (idx > -1) user.wishlist.splice(idx, 1);
  else user.wishlist.push(req.params.productId);
  await user.save();
  res.json({ wishlist: user.wishlist });
});

r.post('/address', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (req.body.isDefault) user.addresses.forEach(a => a.isDefault = false);
  user.addresses.push(req.body);
  await user.save();
  res.json(user.addresses);
});

r.delete('/address/:id', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses = user.addresses.filter(a => a._id.toString() !== req.params.id);
  await user.save();
  res.json(user.addresses);
});

module.exports = r;
