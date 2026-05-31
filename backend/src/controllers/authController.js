const asyncHandler = require('express-async-handler');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });
  if (await User.findOne({ email })) return res.status(409).json({ message: 'Email already registered' });
  const user = await User.create({ name, email, password, isVerified: true });
  res.status(201).json({ user, token: generateToken(user._id) });
});

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !user.password) return res.status(401).json({ message: 'Invalid credentials' });
  if (!await user.matchPassword(password)) return res.status(401).json({ message: 'Invalid credentials' });
  if (!user.isActive) return res.status(403).json({ message: 'Account deactivated' });
  user.lastLogin = new Date();
  await user.save();
  res.json({ user, token: generateToken(user._id) });
});

// POST /api/auth/google
exports.googleAuth = asyncHandler(async (req, res) => {
  const { credential } = req.body;
  const ticket = await client.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
  const { sub: googleId, email, name, picture } = ticket.getPayload();

  let user = await User.findOne({ $or: [{ googleId }, { email }] });
  if (!user) {
    user = await User.create({ name, email, googleId, avatar: picture, isVerified: true });
  } else {
    user.googleId = googleId;
    user.avatar = user.avatar || picture;
    user.lastLogin = new Date();
    await user.save();
  }
  res.json({ user, token: generateToken(user._id) });
});

// GET /api/auth/me
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'name images price slug');
  res.json(user);
});

// PUT /api/auth/profile
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body;
  const user = await User.findByIdAndUpdate(req.user._id, { name, phone, avatar }, { new: true, runValidators: true });
  res.json(user);
});

// PUT /api/auth/password
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);
  if (!await user.matchPassword(currentPassword)) return res.status(401).json({ message: 'Current password incorrect' });
  user.password = newPassword;
  await user.save();
  res.json({ message: 'Password updated successfully' });
});
