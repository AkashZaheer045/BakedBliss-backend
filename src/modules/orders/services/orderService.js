/**
 * Order Service
 * Handles all order-related database operations
 */
const { models, db } = require('../../../../db/sequelize/sequelize');

/**
 * Generate unique order ID
 */
const generateOrderId = () => {
    const timestamp = Date.now().toString();
    const randomPart = Math.random().toString(36).substring(2, 8);
    return `order_${timestamp}_${randomPart}`;
};

/**
 * Create new order
 */
const createOrder = async (userId, cartItems, deliveryAddress, totalAmount) => {
    try {
        const orderInstance = new db(models.orders);
        const orderId = generateOrderId();

        const [newOrder, createErr] = await orderInstance.create({
            order_id: orderId,
            user_id: userId,
            cart_items: cartItems,
            delivery_address: deliveryAddress,
            total_amount: totalAmount,
            status: 'Pending'
        });

        if (createErr) {
            return [null, createErr];
        }

        return [
            {
                orderId: newOrder.order_id,
                userId: newOrder.user_id,
                cartItems: newOrder.cart_items,
                deliveryAddress: newOrder.delivery_address,
                totalAmount: newOrder.total_amount,
                status: newOrder.status,
                createdAt: newOrder.created_at
            },
            null
        ];
    } catch (error) {
        return [null, error];
    }
};

/**
 * Get user's order history
 */
const getOrderHistory = async userId => {
    try {
        const orderInstance = new db(models.orders);
        const [orders, findErr] = await orderInstance.findAll({
            where: { user_id: userId },
            order: [['created_at', 'DESC']]
        });

        if (findErr) {
            return [null, findErr];
        }

        const ordersData = (orders || []).map(order => ({
            orderId: order.order_id,
            userId: order.user_id,
            cartItems: order.cart_items,
            deliveryAddress: order.delivery_address,
            totalAmount: order.total_amount,
            status: order.status,
            createdAt: order.created_at
        }));

        return [ordersData, null];
    } catch (error) {
        return [null, error];
    }
};

/**
 * Get order by order_id
 */
const getOrderById = async orderId => {
    try {
        const orderInstance = new db(models.orders);
        const [order, findErr] = await orderInstance.fetchOne({ order_id: orderId });

        if (findErr) {
            return [null, findErr];
        }
        if (!order) {
            return [null, { message: 'Order not found', status: 404 }];
        }

        return [
            {
                orderId: order.order_id,
                userId: order.user_id,
                cartItems: order.cart_items,
                deliveryAddress: order.delivery_address,
                totalAmount: order.total_amount,
                status: order.status,
                createdAt: order.created_at
            },
            null
        ];
    } catch (error) {
        return [null, error];
    }
};

/**
 * Get all orders with filters (admin)
 */
const getAllOrders = async (filters = {}) => {
    try {
        const { status, page = 1, limit = 10 } = filters;
        const orderInstance = new db(models.orders);

        const where = {};
        if (status) {
            where.status = status;
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const [result, findErr] = await orderInstance.findAndCountAll({
            where,
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset
        });

        if (findErr) {
            return [null, findErr];
        }

        const ordersData = (result?.rows || []).map(order => ({
            id: order.id,
            orderId: order.order_id,
            userId: order.user_id,
            cartItems: order.cart_items,
            deliveryAddress: order.delivery_address,
            totalAmount: order.total_amount,
            status: order.status,
            createdAt: order.created_at
        }));

        return [
            {
                orders: ordersData,
                pagination: {
                    total: result?.count || 0,
                    page: parseInt(page),
                    limit: parseInt(limit)
                }
            },
            null
        ];
    } catch (error) {
        return [null, error];
    }
};

/**
 * Update order status
 */
const updateOrderStatus = async (orderId, status) => {
    try {
        const orderInstance = new db(models.orders);
        const [order, findErr] = await orderInstance.fetchOne({ order_id: orderId });

        if (findErr) {
            return [null, findErr];
        }
        if (!order) {
            return [null, { message: 'Order not found', status: 404 }];
        }

        order.status = status;
        order.updated_at = new Date();
        await order.save();

        return [{ orderId: order.order_id, status: order.status }, null];
    } catch (error) {
        return [null, error];
    }
};

/**
 * Cancel order
 */
const cancelOrder = async (orderId, reason = null) => {
    try {
        const orderInstance = new db(models.orders);
        const [order, findErr] = await orderInstance.fetchOne({ order_id: orderId });

        if (findErr) {
            return [null, findErr];
        }
        if (!order) {
            return [null, { message: 'Order not found', status: 404 }];
        }

        // Only allow cancellation if order is pending or processing
        if (order.status !== 'Pending' && order.status !== 'Processing') {
            return [null, { message: 'Order cannot be cancelled', status: 400 }];
        }

        order.status = 'Cancelled';
        order.cancellation_reason = reason;
        order.updated_at = new Date();
        await order.save();

        return [
            {
                orderId: order.order_id,
                status: order.status,
                cancellationReason: reason
            },
            null
        ];
    } catch (error) {
        return [null, error];
    }
};

/**
 * Get order statistics (admin)
 */
const getOrderStats = async () => {
    try {
        const sequelize = require('../../../../db/sequelize/sequelize');

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

        return [
            {
                totalOrders,
                pendingOrders,
                completedOrders,
                totalRevenue: totalRevenue || 0
            },
            null
        ];
    } catch (error) {
        return [null, error];
    }
};

module.exports = {
    createOrder,
    getOrderHistory,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    cancelOrder,
    getOrderStats,
    generateOrderId
};
