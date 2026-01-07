/**
 * Order Controller
 * Handles HTTP requests/responses, delegates business logic to OrderService
 */
const OrderService = require('../services/orderService');

// Confirm and place an order
const confirmOrder = async (req, res) => {
    try {
        const userId = req.user.uid;
        const { cartItems, deliveryAddress, totalAmount } = req.body;

        if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
            return res.status(400).json({ status: 'error', message: 'Cart items are required' });
        }

        const [order, error] = await OrderService.createOrder(
            userId,
            cartItems,
            deliveryAddress,
            totalAmount
        );

        if (error) {
            console.error('Error confirming order:', error);
            return res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Failed to place order'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Order placed successfully',
            orderId: order.orderId,
            order
        });
    } catch (error) {
        console.error('Error confirming order:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to place order',
            error: error.message
        });
    }
};

// View order history
const viewOrderHistory = async (req, res) => {
    try {
        const userId = req.user.uid;

        const [orders, error] = await OrderService.getOrderHistory(userId);

        if (error) {
            console.error('Error retrieving order history:', error);
            return res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Failed to retrieve order history'
            });
        }

        res.status(200).json({ status: 'success', message: 'Order history retrieved', orders });
    } catch (error) {
        console.error('Error retrieving order history:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve order history',
            error: error.message
        });
    }
};

// Track order status
const getOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;

        const [order, error] = await OrderService.getOrderById(orderId);

        if (error) {
            console.error('Error retrieving order status:', error);
            return res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Failed to retrieve order status'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Order status retrieved',
            orderStatus: order.status,
            order
        });
    } catch (error) {
        console.error('Error retrieving order status:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve order status',
            error: error.message
        });
    }
};

// Get all orders (admin)
const getAllOrders = async (req, res) => {
    try {
        const { status, page, limit } = req.query;

        const [result, error] = await OrderService.getAllOrders({ status, page, limit });

        if (error) {
            console.error('Error getting all orders:', error);
            return res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Failed to get orders'
            });
        }

        res.status(200).json({
            status: 'success',
            data: result
        });
    } catch (error) {
        console.error('Error getting all orders:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get orders',
            error: error.message
        });
    }
};

// Update order status (admin)
const updateOrderStatus = async (req, res) => {
    try {
        const { order_id, status } = req.body;

        const [result, error] = await OrderService.updateOrderStatus(order_id, status);

        if (error) {
            console.error('Error updating order status:', error);
            return res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Failed to update order'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Order status updated',
            data: result
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update order',
            error: error.message
        });
    }
};

// Cancel order
const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { reason } = req.body;

        const [result, error] = await OrderService.cancelOrder(orderId, reason);

        if (error) {
            console.error('Error cancelling order:', error);
            return res.status(error.status || 500).json({
                status: 'error',
                statusCode: error.status || 500,
                message: error.message || 'Failed to cancel order'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Order cancelled successfully',
            data: result
        });
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to cancel order',
            error: error.message
        });
    }
};

// Get order stats (admin)
const getOrderStats = async (req, res) => {
    try {
        const [stats, error] = await OrderService.getOrderStats();

        if (error) {
            console.error('Error getting order stats:', error);
            return res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Failed to get order stats'
            });
        }

        res.status(200).json({
            status: 'success',
            data: stats
        });
    } catch (error) {
        console.error('Error getting order stats:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get order stats',
            error: error.message
        });
    }
};

module.exports = {
    confirmOrder,
    viewOrderHistory,
    getOrderStatus,
    getAllOrders,
    updateOrderStatus,
    cancelOrder,
    getOrderStats
};
