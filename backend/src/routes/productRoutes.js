const express = require('express');
const router = express.Router();
const { getProducts, getProduct, getProductById, createProduct, updateProduct, deleteProduct, deleteProductImage, getCategories, toggleProduct } = require('../controllers/productController');
const { protect, admin, optionalAuth } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.get('/', optionalAuth, getProducts);
router.get('/categories/list', getCategories);
router.get('/admin/:id', protect, admin, getProductById);
router.get('/:slug', getProduct);
router.post('/', protect, admin, upload.array('images', 10), createProduct);
router.put('/:id', protect, admin, upload.array('images', 10), updateProduct);
router.delete('/:id', protect, admin, deleteProduct);
router.delete('/:id/images/:imageId', protect, admin, deleteProductImage);
router.patch('/:id/toggle', protect, admin, toggleProduct);

module.exports = router;
