// orderRoutes.js
const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrder, getAllOrders, updateOrderStatus, processRefund, deleteOrder, requestCancelOrder, getRefundRequests, updateRefundRequest } = require('../controllers/orderController');
const { protect, admin, optionalAuth } = require('../middleware/auth');

router.post('/', optionalAuth, createOrder);
router.get('/my', protect, getMyOrders);
router.get('/refunds', protect, admin, getRefundRequests);
router.get('/', protect, admin, getAllOrders);
router.post('/:id/cancel', protect, requestCancelOrder);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, admin, updateOrderStatus);
router.post('/:id/refund', protect, admin, processRefund);
router.put('/refunds/:id', protect, admin, updateRefundRequest);
router.delete('/:id', protect, admin, deleteOrder);

module.exports = router;
