const express = require('express');
const {
    getDashboardStats,
    getRevenueAnalytics,
    getProductAnalytics
} = require('../controllers/adminDashboardController');
const authenticateToken = require('../../../../middleware/auth_middleware.js');
const { isAdmin } = require('../../../../middleware/role_middleware.js');

const routes = function () {
    const router = express.Router({ mergeParams: true });

    // All admin routes require authentication and admin role
    router.use(authenticateToken);
    router.use(isAdmin);

    // Dashboard statistics
    router.get('/dashboard/stats', getDashboardStats);

    // Analytics
    router.get('/analytics/revenue', getRevenueAnalytics);
    router.get('/analytics/products', getProductAnalytics);

    return router;
};

module.exports = routes;
