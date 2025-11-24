const { db } = require('../../../config/firebaseConfig'); // Adjust the path as necessary

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
        if (!title || !price || !category || !stock) {
            return res.status(400).json({
                status: 'error',
                message: 'Title, price, category, and stock are required.',
            });
        }

        // Create a new product object
        const newProduct = {
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
            createdAt: new Date().toISOString(), // Optional: add created timestamp
        };

        // Save the new product to Firestore
        const productRef = await db.collection('products').add(newProduct);
        const productId = productRef.id;

        return res.status(201).json({
            status: 'success',
            message: 'Product created successfully.',
            data: {
                productId,
                ...newProduct,
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