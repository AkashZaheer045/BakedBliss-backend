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

    // Admin routes - Update and Delete products
    router.put('/:product_id', authenticateToken, createProduct); // Reusing createProduct for update
    router.delete('/:product_id', authenticateToken, async (req, res) => {
        try {
            const { product_id } = req.params;
            const product = await require('../../../../db/sequelize/sequelize').models.products.findOne({
                where: { id: product_id }
            });

            if (!product) {
                return res.status(404).json({ success: false, message: 'Product not found' });
            }

            await product.destroy();
            return res.json({ success: true, message: 'Product deleted successfully' });
        } catch (error) {
            console.error('Delete product error:', error);
            return res.status(500).json({ success: false, message: 'Failed to delete product' });
        }
    });

    // Router to get product by ID (Must be last)
    router.get('/:product_id', getProductById);

    return router;
};

module.exports = routes;