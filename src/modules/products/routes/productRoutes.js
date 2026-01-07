/**
 * Product Routes
 * Per QAutos pattern:
 * - No route-level authentication (handled centrally in app.js)
 * - Validation rules via ValidationRules.rule('methodName')
 * - Centralized Validation.validate middleware
 */
const express = require('express');
const productRules = require('../validations/productValidation');
const Validation = require('../../../../utils/validation');

// Controllers
const {
    searchProducts,
    getProductById,
    getProductsByCategory,
    listProducts,
    getCategories,
    deleteProduct
} = require('../controllers/productController');
const { createProduct, updateProduct } = require('../controllers/productUploadController');
const {
    getTrendingProducts,
    getRecommendations
} = require('../controllers/trendingProductsController');

const routes = function () {
    const router = express.Router({ mergeParams: true });

    //------------------------------------//
    // PUBLIC ROUTES (defined in auth.js allowedPaths)
    //------------------------------------//

    // List products (paginated / filtered)
    router.route('/').get(productRules.rule('list'), Validation.validate, listProducts);

    // Search products
    router.route('/search').get(productRules.rule('search'), Validation.validate, searchProducts);

    // Get categories
    router.route('/categories').get(getCategories);

    // Trending products
    router.route('/trending').get(getTrendingProducts);

    // Get products by category
    router
        .route('/category/:category_name')
        .get(productRules.rule('getByCategory'), Validation.validate, getProductsByCategory);

    //------------------------------------//
    // PROTECTED ROUTES (auth handled centrally)
    //------------------------------------//

    // Upload new product (admin only - role check can be added as middleware)
    router.route('/upload').post(productRules.rule('create'), Validation.validate, createProduct);

    // User-specific recommendations
    router.route('/recommendations/:userId').get(getRecommendations);

    // Update product
    router
        .route('/:product_id')
        .get(productRules.rule('getById'), Validation.validate, getProductById)
        .put(productRules.rule('update'), Validation.validate, updateProduct)
        .delete(productRules.rule('delete'), Validation.validate, deleteProduct);

    return router;
};

module.exports = routes;
