/**
 * Product Service
 * Handles all product-related database operations
 */
const { models, db, Sequelize } = require('../../../../db/sequelize/sequelize');
const { Op } = Sequelize;

/**
 * Search products
 */
const searchProducts = async (query, options = {}) => {
    try {
        const productInstance = new db(models.products);
        const { limit, offset } = options;

        // Search by title first
        let [products, err] = await productInstance.findAll({
            where: { title: { [Op.like]: `%${query}%` } },
            limit,
            offset
        });

        if (err) {
            return [null, err];
        }

        // If no results, search by category
        if (!products || products.length === 0) {
            [products, err] = await productInstance.findAll({
                where: { category: { [Op.like]: `%${query}%` } },
                limit,
                offset
            });
            if (err) {
                return [null, err];
            }
        }

        return [products || [], null];
    } catch (error) {
        return [null, error];
    }
};

/**
 * Get product by ID
 */
const getProductById = async productId => {
    try {
        const productInstance = new db(models.products);
        const [product, err] = await productInstance.findByPk(productId);
        if (err) {
            return [null, err];
        }
        if (!product) {
            return [null, { message: 'Product not found', status: 404 }];
        }
        return [product, null];
    } catch (error) {
        return [null, error];
    }
};

/**
 * Get products by category
 */
const getProductsByCategory = async (categoryName, options = {}) => {
    try {
        const productInstance = new db(models.products);
        const { limit, offset } = options;

        const [result, err] = await productInstance.findAndCountAll({
            where: { category: categoryName },
            offset,
            limit
        });

        if (err) {
            return [null, err];
        }

        return [
            {
                products: result?.rows || [],
                pagination: { total: result?.count || 0 }
            },
            null
        ];
    } catch (error) {
        return [null, error];
    }
};

/**
 * List products with filters
 */
const listProducts = async (filters = {}) => {
    try {
        const { category, featured: _featured, offers: _offers, search, options = {} } = filters;
        const { limit, offset, order } = options;
        const productInstance = new db(models.products);

        const where = {};
        if (category) {
            where.category = category;
        }
        // if (featured !== undefined) where.isFeatured = featured;
        // if (offers !== undefined) where.onOffer = offers;
        if (search) {
            where.title = { [Op.like]: `%${search}%` };
        }

        const [result, err] = await productInstance.findAndCountAll({
            where,
            order,
            limit,
            offset
        });

        if (err) {
            return [null, err];
        }

        return [
            {
                products: result?.rows || [],
                pagination: { total: result?.count || 0 }
            },
            null
        ];
    } catch (error) {
        return [null, error];
    }
};

/**
 * Get categories with counts
 */
const getCategories = async () => {
    try {
        const productInstance = new db(models.products);
        const [results, err] = await productInstance.findAll({
            attributes: ['category', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
            group: ['category']
        });

        if (err) {
            return [null, err];
        }

        const categories = (results || []).map(result => ({
            name: result.category || 'uncategorized',
            count: parseInt(result.dataValues.count)
        }));

        return [categories, null];
    } catch (error) {
        return [null, error];
    }
};

/**
 * Create product
 */
const createProduct = async productData => {
    try {
        const productInstance = new db(models.products);
        const [newProduct, err] = await productInstance.create({
            title: productData.title,
            price: productData.price,
            sale_price: productData.salePrice,
            thumbnail: productData.thumbnail,
            rating: productData.rating,
            category: productData.category,
            ingredients: productData.ingredients,
            description: productData.description,
            tagline: productData.tagline,
            images: productData.images,
            stock: productData.stock
        });

        if (err) {
            return [null, err];
        }
        return [newProduct, null];
    } catch (error) {
        return [null, error];
    }
};

/**
 * Update product
 */
const updateProduct = async (productId, productData) => {
    try {
        const productInstance = new db(models.products);
        const [product, findErr] = await productInstance.findByPk(productId);
        if (findErr) {
            return [null, findErr];
        }
        if (!product) {
            return [null, { message: 'Product not found', status: 404 }];
        }

        // Update fields
        if (productData.title !== undefined) {
            product.title = productData.title;
        }
        if (productData.price !== undefined) {
            product.price = productData.price;
        }
        if (productData.salePrice !== undefined) {
            product.sale_price = productData.salePrice;
        }
        if (productData.thumbnail !== undefined) {
            product.thumbnail = productData.thumbnail;
        }
        if (productData.rating !== undefined) {
            product.rating = productData.rating;
        }
        if (productData.category !== undefined) {
            product.category = productData.category;
        }
        if (productData.ingredients !== undefined) {
            product.ingredients = productData.ingredients;
        }
        if (productData.description !== undefined) {
            product.description = productData.description;
        }
        if (productData.tagline !== undefined) {
            product.tagline = productData.tagline;
        }
        if (productData.images !== undefined) {
            product.images = productData.images;
        }
        if (productData.stock !== undefined) {
            product.stock = productData.stock;
        }
        product.updated_at = new Date();

        await product.save();
        return [product, null];
    } catch (error) {
        return [null, error];
    }
};

/**
 * Delete product
 */
const deleteProduct = async productId => {
    try {
        const productInstance = new db(models.products);
        const [product, findErr] = await productInstance.findByPk(productId);
        if (findErr) {
            return [null, findErr];
        }
        if (!product) {
            return [null, { message: 'Product not found', status: 404 }];
        }

        await product.destroy();
        return [true, null];
    } catch (error) {
        return [null, error];
    }
};

/**
 * Get trending products
 */
const getTrendingProducts = async (limit = 10) => {
    try {
        const productInstance = new db(models.products);
        const [products, err] = await productInstance.findAll({
            order: [['rating', 'DESC']],
            limit
        });
        if (err) {
            return [null, err];
        }
        return [products || [], null];
    } catch (error) {
        return [null, error];
    }
};

/**
 * Get recommendations based on user order history
 */
const getRecommendations = async userId => {
    try {
        const orderInstance = new db(models.orders);
        const productInstance = new db(models.products);

        const [orders, orderErr] = await orderInstance.fetchAll({ user_id: userId });
        if (orderErr) {
            return [null, orderErr];
        }

        if (!orders || orders.length === 0) {
            // Fallback to trending
            return getTrendingProducts(10);
        }

        // Count categories
        const categoryCounts = {};
        orders.forEach(order => {
            (order.cart_items || []).forEach(p => {
                const cat = p.category || 'unknown';
                categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
            });
        });

        const topCategories = Object.entries(categoryCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([cat]) => cat);

        const recommended = [];
        for (const cat of topCategories) {
            const [products] = await productInstance.findAll({
                where: { category: cat },
                limit: 5
            });
            if (products) {
                recommended.push(...products);
            }
        }

        return [recommended, null];
    } catch (error) {
        return [null, error];
    }
};

module.exports = {
    searchProducts,
    getProductById,
    getProductsByCategory,
    listProducts,
    getCategories,
    createProduct,
    updateProduct,
    deleteProduct,
    getTrendingProducts,
    getRecommendations
};
