const express = require('express');
const { createProduct } = require('../controllers/productUploadController');
const { searchProducts, getProductById, getProductsByCategory, listProducts, getCategories } = require('../controllers/productController');
const { getTrendingProducts, getRecommendations } = require('../controllers/trendingProductsController');
const authenticateToken = require('../../../../middleware/authMiddleware.js');

let routes = function () {
    const router = express.Router({ mergeParams: true });

    // Router for searching products
    router.get('/search', searchProducts);

    // List products (paginated / filtered)
    router.get('/', listProducts);

    router.post('/upload', createProduct);

    // Router for trending products
    router.get('/trending', getTrendingProducts);

    // Recommendations (user-specific)
    router.get('/recommendations/:userId', authenticateToken, getRecommendations);

    // Categories metadata
    router.get('/categories', getCategories);

    router.get('/category/:category_name', getProductsByCategory);

    // Router to get product by ID (Must be last)
    router.get('/:product_id', getProductById);

    return router;
};

module.exports = routes;