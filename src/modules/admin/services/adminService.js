/**
 * Admin Service
 * Handles all admin dashboard database operations
 */
const { models, db, Sequelize } = require('../../../../db/sequelize/sequelize');
const { Op } = Sequelize;

/**
 * Get dashboard statistics
 */
const getDashboardStats = async (period = 'week') => {
    try {
        const now = new Date();
        const startDate = new Date();

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

        const orderInstance = new db(models.orders);
        const userInstance = new db(models.users);

        // Execute queries in parallel for better performance
        const [
            revenueResultData,
            totalOrdersData,
            pendingOrdersData,
            totalCustomersData,
            recentOrdersData,
            topProductsDataResult,
            revenueChartData
        ] = await Promise.all([
            // 1. Total Revenue
            orderInstance.findAll({
                attributes: [[Sequelize.fn('SUM', Sequelize.col('total_amount')), 'totalRevenue']],
                where: {
                    created_at: { [Op.gte]: startDate },
                    deleted_at: null
                },
                raw: true
            }),
            // 2. Total Orders
            orderInstance.count({
                where: {
                    created_at: { [Op.gte]: startDate },
                    deleted_at: null
                }
            }),
            // 3. Pending Orders
            orderInstance.count({
                where: {
                    status: 'Pending',
                    deleted_at: null
                }
            }),
            // 4. Total Customers
            userInstance.count({
                where: {
                    role: 'user',
                    deleted_at: null
                }
            }),
            // 5. Recent Orders
            orderInstance.findAll({
                limit: 5,
                order: [['created_at', 'DESC']],
                where: { deleted_at: null }
            }),
            // 6. Top Products Source Data
            orderInstance.findAll({
                attributes: ['cart_items'],
                where: {
                    created_at: { [Op.gte]: startDate },
                    deleted_at: null
                },
                raw: true
            }),
            // 7. Revenue Chart
            orderInstance.findAll({
                attributes: [
                    [Sequelize.fn('DATE', Sequelize.col('created_at')), 'date'],
                    [Sequelize.fn('SUM', Sequelize.col('total_amount')), 'revenue']
                ],
                where: {
                    created_at: { [Op.gte]: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
                    deleted_at: null
                },
                group: [Sequelize.fn('DATE', Sequelize.col('created_at'))],
                order: [[Sequelize.fn('DATE', Sequelize.col('created_at')), 'ASC']],
                raw: true
            })
        ]);

        // Destructure results from the wrapper response [data, err]
        const [revenueResult] = revenueResultData;
        const [totalOrders] = totalOrdersData;
        const [pendingOrders] = pendingOrdersData;
        const [totalCustomers] = totalCustomersData;
        const [recentOrders] = recentOrdersData;
        const [topProductsData] = topProductsDataResult;
        const [revenueChart] = revenueChartData;

        const totalRevenue = parseFloat(revenueResult?.[0]?.totalRevenue || 0);

        // Process top products locally
        const productSales = {};
        (topProductsData || []).forEach(order => {
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
                    productSales[item.product_id].revenue +=
                        (item.price || 0) * (item.quantity || 1);
                });
            }
        });

        const topProducts = Object.values(productSales)
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 5);

        return [
            {
                totalRevenue: totalRevenue.toFixed(2),
                totalOrders: totalOrders || 0,
                totalCustomers: totalCustomers || 0,
                pendingOrders: pendingOrders || 0,
                topProducts,
                recentOrders: (recentOrders || []).map(order => ({
                    order_id: order.order_id,
                    customer_name: 'Customer',
                    total: order.total_amount,
                    status: order.status,
                    created_at: order.created_at
                })),
                revenueChart: (revenueChart || []).map(item => ({
                    date: item.date,
                    revenue: parseFloat(item.revenue || 0).toFixed(2)
                }))
            },
            null
        ];
    } catch (error) {
        return [null, error];
    }
};

/**
 * Get revenue analytics
 */
const getRevenueAnalytics = async (startDate, endDate) => {
    try {
        const orderInstance = new db(models.orders);

        const [analytics, findErr] = await orderInstance.findAll({
            attributes: [
                [Sequelize.fn('DATE', Sequelize.col('created_at')), 'date'],
                [Sequelize.fn('SUM', Sequelize.col('total_amount')), 'revenue'],
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'orderCount']
            ],
            where: {
                created_at: { [Op.between]: [new Date(startDate), new Date(endDate)] },
                deleted_at: null
            },
            group: [Sequelize.fn('DATE', Sequelize.col('created_at'))],
            order: [[Sequelize.fn('DATE', Sequelize.col('created_at')), 'ASC']],
            raw: true
        });

        if (findErr) {
            return [null, findErr];
        }

        const formattedAnalytics = (analytics || []).map(item => ({
            date: item.date,
            revenue: parseFloat(item.revenue || 0).toFixed(2),
            orderCount: parseInt(item.orderCount || 0)
        }));

        return [formattedAnalytics, null];
    } catch (error) {
        return [null, error];
    }
};

/**
 * Get product analytics
 */
const getProductAnalytics = async () => {
    try {
        const orderInstance = new db(models.orders);

        const [orders, findErr] = await orderInstance.findAll({
            attributes: ['cart_items'],
            where: { deleted_at: null },
            raw: true
        });

        if (findErr) {
            return [null, findErr];
        }

        const productAnalytics = {};

        (orders || []).forEach(order => {
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
                    productAnalytics[item.product_id].totalRevenue +=
                        (item.price || 0) * (item.quantity || 1);
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

        return [analytics, null];
    } catch (error) {
        return [null, error];
    }
};

module.exports = {
    getDashboardStats,
    getRevenueAnalytics,
    getProductAnalytics
};
