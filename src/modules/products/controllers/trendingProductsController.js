/**
 * Trending Products Controller
 * Handles HTTP requests/responses for trending and recommendations
 */
const ProductService = require('../services/productService');

// Get trending products
const getTrendingProducts = async (req, res) => {
    try {
        const [products, error] = await ProductService.getTrendingProducts(10);

        if (error) {
            console.error('Error fetching trending products:', error);
            return res
                .status(error.status || 500)
                .json({ status: 'error', message: 'Failed to fetch trending products' });
        }

        res.status(200).json({ status: 'success', data: products });
    } catch (error) {
        console.error('Error fetching trending products:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch trending products' });
    }
};

// Get recommendations
const getRecommendations = async (req, res) => {
    try {
        const userId = req.params.userId;

        const [products, error] = await ProductService.getRecommendations(userId);

        if (error) {
            console.error('Error fetching recommendations:', error);
            return res
                .status(error.status || 500)
                .json({ status: 'error', message: 'Failed to fetch recommendations' });
        }

        res.status(200).json({ status: 'success', data: products });
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch recommendations' });
    }
};

module.exports = { getTrendingProducts, getRecommendations };
