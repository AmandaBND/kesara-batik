const express = require('express');
const router = express.Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, deleteProductImage, getCategories, toggleProduct } = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.get('/', getProducts);
router.get('/categories/list', getCategories);
router.get('/:slug', getProduct);
router.post('/', protect, admin, upload.array('images', 10), createProduct);
router.put('/:id', protect, admin, upload.array('images', 10), updateProduct);
router.delete('/:id', protect, admin, deleteProduct);
router.delete('/:id/images/:imageId', protect, admin, deleteProductImage);
router.patch('/:id/toggle', protect, admin, toggleProduct);

module.exports = router;
