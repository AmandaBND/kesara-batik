// reviewRoutes.js
const express = require('express');
const router = express.Router();
const c = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/auth');

router.get('/product/:productId', c.getProductReviews);
router.post('/product/:productId', protect, c.createReview);
router.put('/:id', protect, c.updateReview);
router.delete('/:id', protect, c.deleteReview);
router.post('/:id/reply', protect, admin, c.adminReply);
router.get('/', protect, admin, c.getAllReviews);

module.exports = router;
