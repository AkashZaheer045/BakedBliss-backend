const express = require('express');
const {
    getDashboardStats,
    getRevenueAnalytics,
    getProductAnalytics
} = require('../controllers/adminDashboardController');
const {
    getAllOrders,
    updateOrderStatus,
    getAllCustomers,
    getCustomerDetails,
    getSettings,
    getPaymentSummary,
    getReviewsSummary,
    getPromotions
} = require('../controllers/adminController');
const { isAdmin } = require('../../../../middleware/role_middleware.js');

const routes = function () {
    const router = express.Router({ mergeParams: true });

    // Debug: Log all admin route requests
    router.use((req, res, next) => {
        console.log('[Admin Routes] Accessing:', req.method, req.path, '| User:', req.user?.role || 'unknown');
        next();
    });

    // All admin routes require admin role
    // Note: authenticateToken is NOT needed here - global auth.js middleware handles it
    router.use(isAdmin);

    // ==================== DASHBOARD ====================
    router.get('/dashboard/stats', getDashboardStats);
    router.get('/analytics/revenue', getRevenueAnalytics);
    router.get('/analytics/products', getProductAnalytics);

    // ==================== ORDERS ====================
    router.get('/orders', getAllOrders);
    router.patch('/orders/:orderId/status', updateOrderStatus);

    // ==================== CUSTOMERS ====================
    router.get('/customers', getAllCustomers);
    router.get('/customers/:userId', getCustomerDetails);

    // ==================== PAYMENTS ====================
    router.get('/payments/summary', getPaymentSummary);

    // ==================== REVIEWS ====================
    router.get('/reviews', getReviewsSummary);

    // ==================== PROMOTIONS ====================
    router.get('/promotions', getPromotions);

    // ==================== SETTINGS ====================
    router.get('/settings', getSettings);

    return router;
};

module.exports = routes;
