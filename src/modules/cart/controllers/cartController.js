/**
 * Cart Controller
 * Handles HTTP requests/responses, delegates business logic to CartService
 */
const CartService = require('../services/cartService');

// Add item to the cart
const addItemToCart = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { productId, quantity } = req.body;

        if (!productId || !quantity) {
            return res.status(400).json({
                status: 'error',
                message: 'productId and quantity are required'
            });
        }

        const [cartItems, error] = await CartService.addItemToCart(userId, productId, quantity);

        if (error) {
            console.error('Error adding item to cart:', error);
            return res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Failed to add item to cart'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Item added to cart',
            cart: { items: cartItems }
        });
    } catch (error) {
        console.error('Error adding item to cart:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to add item',
            error: error.message
        });
    }
};

// View cart items
const viewCart = async (req, res) => {
    try {
        const userId = req.user.user_id;

        const [cart, error] = await CartService.getCart(userId);

        if (error) {
            console.error('Error retrieving cart:', error);
            return res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Failed to retrieve cart'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Cart retrieved',
            cart: { items: cart?.items || [] }
        });
    } catch (error) {
        console.error('Error retrieving cart:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve cart',
            error: error.message
        });
    }
};

// Update cart item
const updateCartItem = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { productId, quantity } = req.body;

        if (!productId || quantity === undefined) {
            return res.status(400).json({
                status: 'error',
                message: 'productId and quantity are required'
            });
        }

        const [cartItems, error] = await CartService.updateCartItem(userId, productId, quantity);

        if (error) {
            console.error('Error updating cart item:', error);
            return res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Failed to update cart item'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Cart item updated',
            cart: { items: cartItems }
        });
    } catch (error) {
        console.error('Error updating cart item:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update item',
            error: error.message
        });
    }
};

// Remove item from cart
const removeItemFromCart = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({
                status: 'error',
                message: 'productId is required'
            });
        }

        const [cartItems, error] = await CartService.removeItemFromCart(userId, productId);

        if (error) {
            console.error('Error removing item from cart:', error);
            return res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Failed to remove item from cart'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Item removed from cart',
            cart: { items: cartItems }
        });
    } catch (error) {
        console.error('Error removing item from cart:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to remove item',
            error: error.message
        });
    }
};

// Clear entire cart
const clearCart = async (req, res) => {
    try {
        const userId = req.user.user_id;

        const [_success, error] = await CartService.clearCart(userId);

        if (error) {
            console.error('Error clearing cart:', error);
            return res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Failed to clear cart'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Cart cleared',
            cart: { items: [] }
        });
    } catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to clear cart',
            error: error.message
        });
    }
};

module.exports = {
    addItemToCart,
    viewCart,
    updateCartItem,
    removeItemFromCart,
    clearCart
};
