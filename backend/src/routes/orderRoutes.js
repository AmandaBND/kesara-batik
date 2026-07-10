// orderRoutes.js
const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrder, getAllOrders, updateOrderStatus, processRefund, deleteOrder } = require('../controllers/orderController');
const { protect, admin, optionalAuth } = require('../middleware/auth');

router.post('/', optionalAuth, createOrder);
router.get('/my', protect, getMyOrders);
router.get('/', protect, admin, getAllOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, admin, updateOrderStatus);
router.post('/:id/refund', protect, admin, processRefund);
router.delete('/:id', protect, admin, deleteOrder);

module.exports = router;
