const { models } = require('../../../../config/sequelizeConfig');
const { Product } = models;

// Function to create a new product
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
            stock,
        } = req.body;

        // Check if all required fields are provided
        if (!title || !price || !category || stock === undefined) {
            return res.status(400).json({
                status: 'error',
                message: 'Title, price, category, and stock are required.',
            });
        }

        // Create a new product
        const newProduct = await Product.create({
            title,
            price,
            sale_price: salePrice,
            thumbnail,
            rating,
            category,
            ingredients,
            description,
            tagline,
            images,
            stock
        });

        return res.status(201).json({
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
            },
        });
    } catch (error) {
        console.error('Error creating product:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal Server Error.',
        });
    }
};

module.exports = { createProduct };