const express = require('express');
const { createProduct } = require('../controllers/productUploadController');
const { searchProducts, getProductById, getProductsByCategory, listProducts, getCategories } = require('../controllers/productController'); // Existing search controller
const { getTrendingProducts, getRecommendations } = require('../controllers/trendingProductsController');
const authenticateToken = require('../../../../middleware/authMiddleware.js');
const router = express.Router();


// Router for searching products
router.get('/search', searchProducts); // Keep the existing search route

// List products (paginated / filtered)
router.get('/', listProducts);

// Categories metadata
router.get('/categories', getCategories);

router.post('/upload', createProduct);

// Router to get product by ID
router.get('/:product_id', getProductById);
router.get('/category/:category_name', getProductsByCategory);


// Router for trending products
router.get('/trending', getTrendingProducts);
// Recommendations (user-specific)
router.get('/recommendations/:userId', authenticateToken, getRecommendations);


module.exports = router;