// adminRoutes.js
const express = require('express');
const r = express.Router();
const { getDashboard, getUsers, updateUser } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');
r.use(protect, admin);
r.get('/dashboard', getDashboard);
r.get('/users', getUsers);
r.patch('/users/:id', updateUser);
module.exports = r;
