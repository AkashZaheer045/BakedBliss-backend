const { Op } = require('sequelize');
const sequelize = require('../../../../db/sequelize/sequelize');
const { successResponse, errorResponse } = require('../../../../helpers/response');

/**
 * Get dashboard statistics
 */
const getDashboardStats = async (req, res, next) => {
    try {
        const { period = 'week' } = req.query;

        // Calculate date range based on period
        const now = new Date();
        let startDate = new Date();

        switch (period) {
            case 'day':
                startDate.setDate(now.getDate() - 1);
                break;
            case 'week':
                startDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(now.getMonth() - 1);
                break;
            case 'year':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            default:
                startDate.setDate(now.getDate() - 7);
        }

        // Get total revenue
        const revenueResult = await sequelize.models.orders.findAll({
            attributes: [
                [sequelize.fn('SUM', sequelize.col('total_amount')), 'totalRevenue']
            ],
            where: {
                created_at: {
                    [Op.gte]: startDate
                },
                deleted_at: null
            },
            raw: true
        });

        const totalRevenue = parseFloat(revenueResult[0]?.totalRevenue || 0);

        // Get total orders
        const totalOrders = await sequelize.models.orders.count({
            where: {
                created_at: {
                    [Op.gte]: startDate
                },
                deleted_at: null
            }
        });

        // Get pending orders
        const pendingOrders = await sequelize.models.orders.count({
            where: {
                status: 'Pending',
                deleted_at: null
            }
        });

        // Get total customers
        const totalCustomers = await sequelize.models.users.count({
            where: {
                role: 'user',
                deleted_at: null
            }
        });

        // Get recent orders
        const recentOrders = await sequelize.models.orders.findAll({
            limit: 5,
            order: [['created_at', 'DESC']],
            include: [{
                model: sequelize.models.users,
                attributes: ['full_name'],
                required: false
            }],
            where: {
                deleted_at: null
            }
        });

        // Get top products (from orders)
        const topProductsData = await sequelize.models.orders.findAll({
            attributes: ['cart_items'],
            where: {
                created_at: {
                    [Op.gte]: startDate
                },
                deleted_at: null
            },
            raw: true
        });

        // Process cart items to find top products
        const productSales = {};
        topProductsData.forEach(order => {
            if (order.cart_items && Array.isArray(order.cart_items)) {
                order.cart_items.forEach(item => {
                    if (!productSales[item.product_id]) {
                        productSales[item.product_id] = {
                            id: item.product_id,
                            title: item.title || 'Unknown Product',
                            sales: 0,
                            revenue: 0
                        };
                    }
                    productSales[item.product_id].sales += item.quantity || 1;
                    productSales[item.product_id].revenue += (item.price || 0) * (item.quantity || 1);
                });
            }
        });

        const topProducts = Object.values(productSales)
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 5);

        // Get revenue chart data (last 7 days)
        const revenueChart = await sequelize.models.orders.findAll({
            attributes: [
                [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
                [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue']
            ],
            where: {
                created_at: {
                    [Op.gte]: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                },
                deleted_at: null
            },
            group: [sequelize.fn('DATE', sequelize.col('created_at'))],
            order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
            raw: true
        });

        const stats = {
            totalRevenue: totalRevenue.toFixed(2),
            totalOrders,
            totalCustomers,
            pendingOrders,
            topProducts,
            recentOrders: recentOrders.map(order => ({
                order_id: order.order_id,
                customer_name: order.user?.full_name || 'Guest',
                total: order.total_amount,
                status: order.status,
                created_at: order.created_at
            })),
            revenueChart: revenueChart.map(item => ({
                date: item.date,
                revenue: parseFloat(item.revenue || 0).toFixed(2)
            }))
        };

        return successResponse(res, 'Dashboard statistics retrieved successfully', stats);
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return errorResponse(res, 'Failed to fetch dashboard statistics', 500);
    }
};

/**
 * Get revenue analytics
 */
const getRevenueAnalytics = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return errorResponse(res, 'Start date and end date are required', 400);
        }

        const analytics = await sequelize.models.orders.findAll({
            attributes: [
                [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
                [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'orderCount']
            ],
            where: {
                created_at: {
                    [Op.between]: [new Date(startDate), new Date(endDate)]
                },
                deleted_at: null
            },
            group: [sequelize.fn('DATE', sequelize.col('created_at'))],
            order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
            raw: true
        });

        const formattedAnalytics = analytics.map(item => ({
            date: item.date,
            revenue: parseFloat(item.revenue || 0).toFixed(2),
            orderCount: parseInt(item.orderCount || 0)
        }));

        return successResponse(res, 'Revenue analytics retrieved successfully', formattedAnalytics);
    } catch (error) {
        console.error('Error fetching revenue analytics:', error);
        return errorResponse(res, 'Failed to fetch revenue analytics', 500);
    }
};

/**
 * Get product analytics
 */
const getProductAnalytics = async (req, res, next) => {
    try {
        // Get all orders with cart items
        const orders = await sequelize.models.orders.findAll({
            attributes: ['cart_items'],
            where: {
                deleted_at: null
            },
            raw: true
        });

        // Process cart items to get product analytics
        const productAnalytics = {};

        orders.forEach(order => {
            if (order.cart_items && Array.isArray(order.cart_items)) {
                order.cart_items.forEach(item => {
                    if (!productAnalytics[item.product_id]) {
                        productAnalytics[item.product_id] = {
                            product_id: item.product_id,
                            title: item.title || 'Unknown Product',
                            totalSales: 0,
                            totalRevenue: 0,
                            orderCount: 0
                        };
                    }
                    productAnalytics[item.product_id].totalSales += item.quantity || 1;
                    productAnalytics[item.product_id].totalRevenue += (item.price || 0) * (item.quantity || 1);
                    productAnalytics[item.product_id].orderCount += 1;
                });
            }
        });

        const analytics = Object.values(productAnalytics)
            .sort((a, b) => b.totalRevenue - a.totalRevenue)
            .map(item => ({
                ...item,
                totalRevenue: parseFloat(item.totalRevenue).toFixed(2),
                averageOrderValue: (item.totalRevenue / item.orderCount).toFixed(2)
            }));

        return successResponse(res, 'Product analytics retrieved successfully', analytics);
    } catch (error) {
        console.error('Error fetching product analytics:', error);
        return errorResponse(res, 'Failed to fetch product analytics', 500);
    }
};

module.exports = {
    getDashboardStats,
    getRevenueAnalytics,
    getProductAnalytics
};
