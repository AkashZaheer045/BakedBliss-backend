const express = require('express');
const { confirmOrder, viewOrderHistory, getOrderStatus } = require('../controllers/orderController');
const authenticateToken = require('../../../../middleware/authMiddleware');

let routes = function () {
    const router = express.Router({ mergeParams: true });

    // Customer order routes
    router.post('/create', authenticateToken, confirmOrder);
    router.post('/confirm', authenticateToken, confirmOrder); // Alias for backward compatibility
    router.get('/history', authenticateToken, viewOrderHistory);
    router.get('/user/:userId', authenticateToken, viewOrderHistory);
    router.get('/status/:orderId', authenticateToken, getOrderStatus);
    router.get('/:orderId', authenticateToken, getOrderStatus);
    router.put('/cancel/:orderId', authenticateToken, async (req, res) => {
        try {
            const { orderId } = req.params;
            const sequelize = require('../../../../db/sequelize/sequelize');

            const order = await sequelize.models.orders.findOne({
                where: { order_id: orderId }
            });

            if (!order) {
                return res.status(404).json({ success: false, message: 'Order not found' });
            }

            // Only allow cancellation if order is pending
            if (order.status !== 'Pending' && order.status !== 'Processing') {
                return res.status(400).json({ success: false, message: 'Order cannot be cancelled' });
            }

            order.status = 'Cancelled';
            await order.save();

            return res.json({ success: true, message: 'Order cancelled successfully', data: order });
        } catch (error) {
            console.error('Cancel order error:', error);
            return res.status(500).json({ success: false, message: 'Failed to cancel order' });
        }
    });

    // Admin order routes
    router.get('/all', authenticateToken, async (req, res) => {
        try {
            const { status, page = 1, limit = 20 } = req.query;
            const sequelize = require('../../../../db/sequelize/sequelize');

            const where = { deleted_at: null };
            if (status) where.status = status;

            const offset = (parseInt(page) - 1) * parseInt(limit);

            const { count, rows } = await sequelize.models.orders.findAndCountAll({
                where,
                limit: parseInt(limit),
                offset,
                order: [['created_at', 'DESC']]
            });

            return res.json({
                success: true,
                data: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(count / parseInt(limit))
                }
            });
        } catch (error) {
            console.error('Get all orders error:', error);
            return res.status(500).json({ success: false, message: 'Failed to fetch orders' });
        }
    });

    router.put('/status', authenticateToken, async (req, res) => {
        try {
            const { order_id, status } = req.body;
            const sequelize = require('../../../../db/sequelize/sequelize');

            if (!order_id || !status) {
                return res.status(400).json({ success: false, message: 'Order ID and status are required' });
            }

            const order = await sequelize.models.orders.findOne({
                where: { order_id }
            });

            if (!order) {
                return res.status(404).json({ success: false, message: 'Order not found' });
            }

            order.status = status;
            order.updated_at = new Date();
            await order.save();

            return res.json({ success: true, message: 'Order status updated successfully', data: order });
        } catch (error) {
            console.error('Update order status error:', error);
            return res.status(500).json({ success: false, message: 'Failed to update order status' });
        }
    });

    router.get('/stats', authenticateToken, async (req, res) => {
        try {
            const sequelize = require('../../../../db/sequelize/sequelize');
            const { Op } = require('sequelize');

            const totalOrders = await sequelize.models.orders.count({
                where: { deleted_at: null }
            });

            const pendingOrders = await sequelize.models.orders.count({
                where: { status: 'Pending', deleted_at: null }
            });

            const completedOrders = await sequelize.models.orders.count({
                where: { status: 'Delivered', deleted_at: null }
            });

            const totalRevenue = await sequelize.models.orders.sum('total_amount', {
                where: { deleted_at: null }
            });

            return res.json({
                success: true,
                data: {
                    totalOrders,
                    pendingOrders,
                    completedOrders,
                    totalRevenue: totalRevenue || 0
                }
            });
        } catch (error) {
            console.error('Get order stats error:', error);
            return res.status(500).json({ success: false, message: 'Failed to fetch order stats' });
        }
    });

    return router;
};

module.exports = routes;