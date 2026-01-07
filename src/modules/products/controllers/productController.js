/**
 * Product Controller
 * Handles HTTP requests/responses, delegates business logic to ProductService
 */
const ProductService = require('../services/productService');
const paginationHelper = require('../../../../helpers/pagination');

// Search products
const searchProducts = async (req, res) => {
    try {
        const { query, limit } = req.query;
        if (limit) {
            req.query.per_page = limit;
        }

        if (!query) {
            return res
                .status(400)
                .json({ status: 'error', message: 'Query parameter is required.' });
        }

        const queryOptions = {};
        const _pagination = paginationHelper(req, queryOptions);

        const [products, error] = await ProductService.searchProducts(query, queryOptions);

        if (error) {
            console.error('Error fetching products:', error);
            return res
                .status(error.status || 500)
                .json({ status: 'error', message: error.message || 'Server error' });
        }

        if (!products || products.length === 0) {
            return res.status(404).json({ status: 'error', message: 'No products found.' });
        }

        res.status(200).json({ status: 'success', data: products });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ status: 'error', message: 'Server error', error: error.message });
    }
};

// Get product by ID
const getProductById = async (req, res) => {
    try {
        const { product_id } = req.params;

        const [product, error] = await ProductService.getProductById(product_id);

        if (error) {
            console.error('Error fetching product:', error);
            return res
                .status(error.status || 500)
                .json({ status: 'error', message: error.message || 'Internal server error' });
        }

        res.status(200).json({ status: 'success', data: product });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get products by category
const getProductsByCategory = async (req, res) => {
    try {
        const categoryName = req.params.category_name;
        const { limit } = req.query;
        if (limit) {
            req.query.per_page = limit;
        }

        const queryOptions = {};
        const pagination = paginationHelper(req, queryOptions);

        const [result, error] = await ProductService.getProductsByCategory(
            categoryName,
            queryOptions
        );

        if (error) {
            console.error('Error fetching products by category:', error);
            return res
                .status(error.status || 500)
                .json({ status: 'error', message: error.message || 'Error fetching products' });
        }

        if (result.products.length === 0) {
            return res
                .status(404)
                .json({ status: 'error', message: 'No products found in this category' });
        }

        pagination.setCount(result.pagination.total);

        res.status(200).json({
            status: 'success',
            data: result.products,
            pagination: {
                total: result.pagination.total,
                page: pagination.page + 1,
                pages: pagination.pages,
                limit: pagination.per_page
            }
        });
    } catch (error) {
        console.error('Error fetching products by category:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching products',
            error: error.message
        });
    }
};

// List products with filters
const listProducts = async (req, res) => {
    try {
        const { page: _page, limit, category, featured, offers, sort, search } = req.query;
        if (limit) {
            req.query.per_page = limit;
        }

        // Map custom sort to helper format
        if (sort) {
            if (sort === 'price_asc') {
                req.query.sort_by = 'price';
                req.query.sort_order = 'ASC';
            } else if (sort === 'price_desc') {
                req.query.sort_by = 'price';
                req.query.sort_order = 'DESC';
            } else if (sort === 'rating') {
                req.query.sort_by = 'rating';
                req.query.sort_order = 'DESC';
            } else {
                req.query.sort_by = 'created_at';
                req.query.sort_order = 'DESC';
            }
        } else {
            // Default
            req.query.sort_by = 'created_at';
            req.query.sort_order = 'DESC';
        }

        const queryOptions = {};
        const pagination = paginationHelper(req, queryOptions);

        const [result, error] = await ProductService.listProducts({
            category,
            featured: featured === 'true',
            offers: offers === 'true',
            search,
            options: queryOptions
        });

        if (error) {
            console.error('Error listing products:', error);
            return res
                .status(error.status || 500)
                .json({ status: 'error', message: error.message || 'Failed to list products' });
        }

        pagination.setCount(result.pagination.total);

        res.status(200).json({
            status: 'success',
            data: result.products,
            pagination: {
                total: result.pagination.total,
                page: pagination.page + 1,
                pages: pagination.pages,
                limit: pagination.per_page
            }
        });
    } catch (error) {
        console.error('Error listing products:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to list products',
            error: error.message
        });
    }
};

// Get categories
const getCategories = async (req, res) => {
    try {
        const [categories, error] = await ProductService.getCategories();

        if (error) {
            console.error('Error fetching categories:', error);
            return res
                .status(error.status || 500)
                .json({ status: 'error', message: error.message || 'Failed to fetch categories' });
        }

        res.status(200).json({ status: 'success', data: categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch categories',
            error: error.message
        });
    }
};

// Delete product
const deleteProduct = async (req, res) => {
    try {
        const { product_id } = req.params;

        const [_success, error] = await ProductService.deleteProduct(product_id);

        if (error) {
            console.error('Delete product error:', error);
            return res
                .status(error.status || 500)
                .json({ status: 'error', message: error.message || 'Failed to delete product' });
        }

        res.status(200).json({ status: 'success', message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete product',
            error: error.message
        });
    }
};

module.exports = {
    searchProducts,
    getProductById,
    getProductsByCategory,
    listProducts,
    getCategories,
    deleteProduct
};
