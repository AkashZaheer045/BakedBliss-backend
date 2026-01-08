/**
 * Admin Controller
 * Handles HTTP requests/responses for admin management features
 */
const { models, db, Sequelize } = require('../../../../db/sequelize/sequelize');
const { successResponse, errorResponse } = require('../../../../helpers/response');
const { Op } = Sequelize;

/**
 * Get all orders with filters (Admin)
 */
const getAllOrders = async (req, res) => {
    try {
        const { status, page = 1, limit = 20, search } = req.query;
        const offset = (page - 1) * limit;

        const orderInstance = new db(models.orders);
        const where = { deleted_at: null };

        if (status && status !== 'all') {
            where.status = status;
        }

        if (search) {
            where[Op.or] = [
                { order_id: { [Op.like]: `%${search}%` } },
                { user_id: { [Op.like]: `%${search}%` } }
            ];
        }

        const [orders, countErr] = await orderInstance.count({ where });
        const [orderList, findErr] = await orderInstance.findAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });

        if (findErr) {
            return errorResponse(res, 'Failed to fetch orders', 500);
        }

        return successResponse(res, 'Orders retrieved successfully', {
            orders: orderList || [],
            pagination: {
                total: orders || 0,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil((orders || 0) / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        return errorResponse(res, 'Failed to fetch orders', 500);
    }
};

/**
 * Update order status (Admin)
 */
const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const validStatuses = ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Delivered', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            return errorResponse(res, 'Invalid status', 400);
        }

        const orderInstance = new db(models.orders);
        const [order, findErr] = await orderInstance.fetchOne({ order_id: orderId });

        if (findErr || !order) {
            return errorResponse(res, 'Order not found', 404);
        }

        order.status = status;
        order.updated_at = new Date();
        await order.save();

        return successResponse(res, 'Order status updated successfully', { order });
    } catch (error) {
        console.error('Error updating order:', error);
        return errorResponse(res, 'Failed to update order', 500);
    }
};

/**
 * Get all customers (Admin)
 */
const getAllCustomers = async (req, res) => {
    try {
        const { page = 1, limit = 20, search } = req.query;
        const offset = (page - 1) * limit;

        const userInstance = new db(models.users);
        const where = { role: 'user', deleted_at: null };

        if (search) {
            where[Op.or] = [
                { full_name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ];
        }

        const [total] = await userInstance.count({ where });
        const [users, findErr] = await userInstance.findAll({
            where,
            attributes: { exclude: ['password', 'salt'] },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });

        if (findErr) {
            return errorResponse(res, 'Failed to fetch customers', 500);
        }

        // Get order count for each customer
        const orderInstance = new db(models.orders);
        const customersWithStats = await Promise.all((users || []).map(async (user) => {
            const [orderCount] = await orderInstance.count({
                where: { user_id: user.user_id, deleted_at: null }
            });
            const [totalSpent] = await orderInstance.findAll({
                attributes: [[Sequelize.fn('SUM', Sequelize.col('total_amount')), 'total']],
                where: { user_id: user.user_id, deleted_at: null },
                raw: true
            });

            return {
                id: user.id,
                userId: user.user_id,
                name: user.full_name,
                email: user.email,
                phone: user.phone_number,
                joinedAt: user.created_at,
                orderCount: orderCount || 0,
                totalSpent: parseFloat(totalSpent?.[0]?.total || 0).toFixed(2)
            };
        }));

        return successResponse(res, 'Customers retrieved successfully', {
            customers: customersWithStats,
            pagination: {
                total: total || 0,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil((total || 0) / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching customers:', error);
        return errorResponse(res, 'Failed to fetch customers', 500);
    }
};

/**
 * Get customer details (Admin)
 */
const getCustomerDetails = async (req, res) => {
    try {
        const { userId } = req.params;

        const userInstance = new db(models.users);
        const [user, findErr] = await userInstance.fetchOne({ user_id: userId });

        if (findErr || !user) {
            return errorResponse(res, 'Customer not found', 404);
        }

        // Get customer orders
        const orderInstance = new db(models.orders);
        const [orders] = await orderInstance.findAll({
            where: { user_id: userId, deleted_at: null },
            order: [['created_at', 'DESC']],
            limit: 10
        });

        return successResponse(res, 'Customer details retrieved', {
            customer: {
                id: user.id,
                userId: user.user_id,
                name: user.full_name,
                email: user.email,
                phone: user.phone_number,
                addresses: user.addresses,
                joinedAt: user.created_at
            },
            recentOrders: orders || []
        });
    } catch (error) {
        console.error('Error fetching customer:', error);
        return errorResponse(res, 'Failed to fetch customer', 500);
    }
};

/**
 * Get admin settings
 */
const getSettings = async (req, res) => {
    try {
        // Return app settings (could be stored in DB in future)
        return successResponse(res, 'Settings retrieved successfully', {
            store: {
                name: 'Baked Bliss',
                email: 'contact@bakedbliss.com',
                phone: '+1 (555) 123-4567',
                address: '123 Bakery Lane, Sweet City, SC 12345',
                currency: 'USD',
                timezone: 'America/New_York'
            },
            notifications: {
                emailOnNewOrder: true,
                emailOnOrderStatus: true,
                lowStockAlert: true,
                lowStockThreshold: 10
            },
            delivery: {
                freeDeliveryThreshold: 50,
                deliveryFee: 5.99,
                estimatedTime: '30-45 mins'
            }
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        return errorResponse(res, 'Failed to fetch settings', 500);
    }
};

/**
 * Get payment summary (Admin)
 */
const getPaymentSummary = async (req, res) => {
    try {
        const orderInstance = new db(models.orders);

        // Get total revenue
        const [totalRevenue] = await orderInstance.findAll({
            attributes: [[Sequelize.fn('SUM', Sequelize.col('total_amount')), 'total']],
            where: { deleted_at: null },
            raw: true
        });

        // Get revenue by status
        const [revenueByStatus] = await orderInstance.findAll({
            attributes: [
                'status',
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
                [Sequelize.fn('SUM', Sequelize.col('total_amount')), 'total']
            ],
            where: { deleted_at: null },
            group: ['status'],
            raw: true
        });

        // Get recent transactions (orders)
        const [recentTransactions] = await orderInstance.findAll({
            where: { deleted_at: null },
            order: [['created_at', 'DESC']],
            limit: 10
        });

        return successResponse(res, 'Payment summary retrieved', {
            totalRevenue: parseFloat(totalRevenue?.[0]?.total || 0).toFixed(2),
            revenueByStatus: (revenueByStatus || []).map(item => ({
                status: item.status,
                count: parseInt(item.count || 0),
                total: parseFloat(item.total || 0).toFixed(2)
            })),
            recentTransactions: (recentTransactions || []).map(order => ({
                id: order.order_id,
                amount: order.total_amount,
                status: order.status,
                date: order.created_at
            }))
        });
    } catch (error) {
        console.error('Error fetching payments:', error);
        return errorResponse(res, 'Failed to fetch payment data', 500);
    }
};

/**
 * Get reviews summary (Admin) - uses contact messages as feedback
 */
const getReviewsSummary = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        // Use contact_messages as reviews/feedback source
        const contactInstance = new db(models.contact_messages);

        const [total] = await contactInstance.count({ where: { deleted_at: null } });
        const [messages, findErr] = await contactInstance.findAll({
            where: { deleted_at: null },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });

        if (findErr) {
            return errorResponse(res, 'Failed to fetch reviews', 500);
        }

        return successResponse(res, 'Reviews retrieved successfully', {
            reviews: (messages || []).map(msg => ({
                id: msg.id,
                name: msg.name,
                email: msg.email,
                subject: msg.subject,
                message: msg.message,
                status: msg.status || 'pending',
                createdAt: msg.created_at
            })),
            pagination: {
                total: total || 0,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil((total || 0) / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return errorResponse(res, 'Failed to fetch reviews', 500);
    }
};

/**
 * Get promotions (placeholder - can be extended with promotions table)
 */
const getPromotions = async (req, res) => {
    try {
        // Placeholder - return sample promotions
        // In a real app, this would query a promotions table
        return successResponse(res, 'Promotions retrieved successfully', {
            promotions: [
                {
                    id: 1,
                    code: 'WELCOME10',
                    description: '10% off first order',
                    discount: 10,
                    type: 'percentage',
                    active: true,
                    usageCount: 45,
                    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                },
                {
                    id: 2,
                    code: 'FREESHIP',
                    description: 'Free shipping on orders over $25',
                    discount: 5.99,
                    type: 'fixed',
                    active: true,
                    usageCount: 120,
                    expiresAt: null
                }
            ],
            message: 'Note: Promotions feature requires database table. These are sample entries.'
        });
    } catch (error) {
        console.error('Error fetching promotions:', error);
        return errorResponse(res, 'Failed to fetch promotions', 500);
    }
};

module.exports = {
    getAllOrders,
    updateOrderStatus,
    getAllCustomers,
    getCustomerDetails,
    getSettings,
    getPaymentSummary,
    getReviewsSummary,
    getPromotions
};
