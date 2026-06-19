const asyncHandler = require('express-async-handler');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

let client;
const getGoogleAudiences = () => {
  const raw = process.env.GOOGLE_CLIENT_ID || '';
  return raw.split(',').map(id => id.trim()).filter(Boolean);
};

const audiences = getGoogleAudiences();
if (!audiences.length) {
  console.warn('⚠️  GOOGLE_CLIENT_ID not set — Google Sign-In will not work');
} else {
  try {
    client = new OAuth2Client(audiences[0]);
  } catch (err) {
    console.error('❌ Failed to initialize Google OAuth Client:', err.message);
  }
}

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

  if (!credential) {
    return res.status(400).json({ message: 'Google credential is required' });
  }

  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(503).json({ message: 'Google authentication is not configured on the server' });
  }

  if (!client) {
    return res.status(503).json({ message: 'Google authentication service not available' });
  }

  const allowedAudiences = getGoogleAudiences();

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: allowedAudiences.length > 1 ? allowedAudiences : allowedAudiences[0],
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture, email_verified: emailVerified } = payload;

    if (!googleId || !email) {
      return res.status(400).json({ message: 'Invalid Google profile data' });
    }

    if (emailVerified === false) {
      return res.status(401).json({ message: 'Google email address is not verified' });
    }

    let user = await User.findOne({ $or: [{ googleId }, { email: email.toLowerCase() }] });

    if (!user) {
      user = await User.create({
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        googleId,
        avatar: picture || '',
        isVerified: true,
        isActive: true,
      });
    } else {
      if (!user.isActive) {
        return res.status(403).json({ message: 'Account deactivated' });
      }
      user.googleId = googleId;
      if (picture && !user.avatar) user.avatar = picture;
      if (name && !user.name) user.name = name;
      user.lastLogin = new Date();
      await user.save();
    }

    res.json({ user, token: generateToken(user._id) });
  } catch (err) {
    console.error('❌ Google auth verification error:', err.message);

    if (err.message?.includes('Token used too early') || err.message?.includes('Token used too late')) {
      return res.status(401).json({ message: 'Google token expired. Please try again.' });
    }
    if (err.message?.includes('audience') || err.message?.includes('Audience')) {
      return res.status(401).json({ message: 'Google authentication failed. Client ID mismatch.' });
    }

    return res.status(401).json({ message: 'Google authentication failed. Invalid token.' });
  }
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
