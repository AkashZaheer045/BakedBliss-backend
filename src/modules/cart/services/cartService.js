/**
 * Cart Service
 * Handles all cart-related business logic and database operations
 */
const { models, db } = require('../../../../db/sequelize/sequelize');

/**
 * Get user's cart
 * @param {string} userId - User ID
 * @returns {Promise<[cart, error]>}
 */
const getCart = async userId => {
    try {
        const cartInstance = new db(models.carts);
        const productInstance = new db(models.products);

        const [cart, findErr] = await cartInstance.fetchOne({ user_id: userId });
        if (findErr) {
            return [null, findErr];
        }

        if (!cart || !cart.items || cart.items.length === 0) {
            return [{ items: [] }, null];
        }

        // Fetch product details for each item
        const enrichedItems = await Promise.all(
            cart.items.map(async item => {
                const [product, prodErr] = await productInstance.findByPk(item.productId);
                if (prodErr || !product) {
                    return { ...item, title: 'Unknown Product', price: 0, thumbnail: '' };
                }

                return {
                    ...item,
                    title: product.title,
                    price: product.price,
                    thumbnail: product.thumbnail,
                    category: product.category,
                    description: product.description
                };
            })
        );

        cart.items = enrichedItems;
        return [cart, null];
    } catch (error) {
        return [null, error];
    }
};

/**
 * Add item to cart
 * @param {string} userId - User ID
 * @param {number} productId - Product ID
 * @param {number} quantity - Quantity to add
 * @returns {Promise<[cartItems, error]>}
 */
const addItemToCart = async (userId, productId, quantity) => {
    try {
        const cartInstance = new db(models.carts);
        const productInstance = new db(models.products);

        // Check if product exists
        const [product, prodErr] = await productInstance.findByPk(productId);
        if (prodErr) {
            return [null, prodErr];
        }
        if (!product) {
            return [null, { message: 'Product not found', status: 404 }];
        }

        // Find existing cart for user
        let [cart, findErr] = await cartInstance.fetchOne({ user_id: userId }); // eslint-disable-line prefer-const
        if (findErr) {
            return [null, findErr];
        }

        let cartItems = [];
        if (cart) {
            // Make a copy of items to ensure change detection works
            cartItems = JSON.parse(JSON.stringify(cart.items || []));
        }

        // Add or update item in the cart (store mostly just ID and qty to save space, but backend return can enrich)
        // Storing minimal info in DB is better for consistency, but if prices change, user might see old price.
        // For simplicity, let's just store productId and quantity in DB, and enrich on retrieval.
        // Wait, if we only store ID, we need to enrich return value here too.

        const itemIndex = cartItems.findIndex(item => item.productId === productId);
        if (itemIndex > -1) {
            cartItems[itemIndex].quantity += quantity;
        } else {
            cartItems.push({ productId, quantity });
        }

        // Update or create cart
        if (cart) {
            cart.items = cartItems;
            cart.changed('items', true);
            cart.updated_at = new Date();
            await cart.save();
        } else {
            const [newCart, createErr] = await cartInstance.create({
                user_id: userId,
                items: cartItems,
                created_at: new Date()
            });
            if (createErr) {
                return [null, createErr];
            }
            cart = newCart;
        }

        // Enrich items for response
        const enrichedItems = await Promise.all(
            cartItems.map(async item => {
                if (item.productId === productId) {
                    return {
                        ...item,
                        title: product.title,
                        price: product.price,
                        thumbnail: product.thumbnail
                    };
                }
                // For other items, we might need to fetch if we want full cart return
                // But usually add-to-cart just relies on result success or partial update
                // Let's match getCart behavior and enrich all
                const [p] = await productInstance.findByPk(item.productId);
                return {
                    ...item,
                    title: p ? p.title : 'Unknown',
                    price: p ? p.price : 0,
                    thumbnail: p ? p.thumbnail : ''
                };
            })
        );

        return [enrichedItems, null];
    } catch (error) {
        return [null, error];
    }
};

/**
 * Update cart item quantity
 * @param {string} userId - User ID
 * @param {number} productId - Product ID
 * @param {number} quantity - New quantity
 * @returns {Promise<[cartItems, error]>}
 */
const updateCartItem = async (userId, productId, quantity) => {
    try {
        const cartInstance = new db(models.carts);
        const productInstance = new db(models.products);

        const [cart, findErr] = await cartInstance.fetchOne({ user_id: userId });
        if (findErr) {
            return [null, findErr];
        }

        if (!cart) {
            return [null, { message: 'Cart is empty', status: 404 }];
        }

        const cartItems = JSON.parse(JSON.stringify(cart.items || []));
        const itemIndex = cartItems.findIndex(item => item.productId === productId);

        if (itemIndex > -1) {
            cartItems[itemIndex].quantity = quantity;
            cart.items = cartItems;
            cart.changed('items', true);
            cart.updated_at = new Date();
            await cart.save();

            // Enrich items
            const enrichedItems = await Promise.all(
                cartItems.map(async item => {
                    const [p] = await productInstance.findByPk(item.productId);
                    return {
                        ...item,
                        title: p ? p.title : 'Unknown',
                        price: p ? p.price : 0,
                        thumbnail: p ? p.thumbnail : ''
                    };
                })
            );

            return [enrichedItems, null];
        } else {
            return [null, { message: 'Item not found in cart', status: 404 }];
        }
    } catch (error) {
        return [null, error];
    }
};

/**
 * Remove item from cart
 * @param {string} userId - User ID
 * @param {number} productId - Product ID
 * @returns {Promise<[cartItems, error]>}
 */
const removeItemFromCart = async (userId, productId) => {
    try {
        const cartInstance = new db(models.carts);
        const productInstance = new db(models.products);

        const [cart, findErr] = await cartInstance.fetchOne({ user_id: userId });
        if (findErr) {
            return [null, findErr];
        }

        if (!cart) {
            return [null, { message: 'Cart is empty', status: 404 }];
        }

        let cartItems = JSON.parse(JSON.stringify(cart.items || []));
        cartItems = cartItems.filter(item => item.productId !== productId);

        cart.items = cartItems;
        cart.changed('items', true);
        cart.updated_at = new Date();
        await cart.save();

        // Enrich items
        const enrichedItems = await Promise.all(
            cartItems.map(async item => {
                const [p] = await productInstance.findByPk(item.productId);
                return {
                    ...item,
                    title: p ? p.title : 'Unknown',
                    price: p ? p.price : 0,
                    thumbnail: p ? p.thumbnail : ''
                };
            })
        );

        return [enrichedItems, null];
    } catch (error) {
        return [null, error];
    }
};

/**
 * Clear entire cart
 * @param {string} userId - User ID
 * @returns {Promise<[success, error]>}
 */
const clearCart = async userId => {
    try {
        const cartInstance = new db(models.carts);

        const [cart, findErr] = await cartInstance.fetchOne({ user_id: userId });
        if (findErr) {
            return [null, findErr];
        }

        if (!cart) {
            return [true, null]; // Cart already empty
        }

        cart.items = [];
        cart.changed('items', true);
        cart.updated_at = new Date();
        await cart.save();

        return [true, null];
    } catch (error) {
        return [null, error];
    }
};

module.exports = {
    getCart,
    addItemToCart,
    updateCartItem,
    removeItemFromCart,
    clearCart
};
