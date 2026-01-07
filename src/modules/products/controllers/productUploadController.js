/**
 * Product Upload Controller
 * Handles HTTP requests/responses for product creation/update
 */
const ProductService = require('../services/productService');

// Create product
const createProduct = async (req, res) => {
    try {
        const {
            title,
            price,
            salePrice,
            thumbnail,
            rating,
            category,
            ingredients,
            description,
            tagline,
            images,
            stock
        } = req.body;

        if (!title || !price || !category || stock === undefined) {
            return res.status(400).json({
                status: 'error',
                message: 'Title, price, category, and stock are required.'
            });
        }

        const [newProduct, error] = await ProductService.createProduct({
            title,
            price,
            salePrice,
            thumbnail,
            rating,
            category,
            ingredients,
            description,
            tagline,
            images,
            stock
        });

        if (error) {
            console.error('Error creating product:', error);
            return res
                .status(error.status || 500)
                .json({ status: 'error', message: error.message || 'Internal Server Error' });
        }

        res.status(201).json({
            status: 'success',
            message: 'Product created successfully.',
            data: {
                productId: newProduct.id,
                title: newProduct.title,
                price: newProduct.price,
                salePrice: newProduct.sale_price,
                thumbnail: newProduct.thumbnail,
                rating: newProduct.rating,
                category: newProduct.category,
                ingredients: newProduct.ingredients,
                description: newProduct.description,
                tagline: newProduct.tagline,
                images: newProduct.images,
                stock: newProduct.stock,
                createdAt: newProduct.created_at
            }
        });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
};

// Update product
const updateProduct = async (req, res) => {
    try {
        const { product_id } = req.params;
        const {
            title,
            price,
            salePrice,
            thumbnail,
            rating,
            category,
            ingredients,
            description,
            tagline,
            images,
            stock
        } = req.body;

        const [product, error] = await ProductService.updateProduct(product_id, {
            title,
            price,
            salePrice,
            thumbnail,
            rating,
            category,
            ingredients,
            description,
            tagline,
            images,
            stock
        });

        if (error) {
            console.error('Error updating product:', error);
            return res
                .status(error.status || 500)
                .json({ status: 'error', message: error.message || 'Internal Server Error' });
        }

        res.status(200).json({
            status: 'success',
            message: 'Product updated successfully.',
            data: {
                productId: product.id,
                title: product.title,
                price: product.price,
                salePrice: product.sale_price,
                category: product.category,
                stock: product.stock
            }
        });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
};

module.exports = { createProduct, updateProduct };
