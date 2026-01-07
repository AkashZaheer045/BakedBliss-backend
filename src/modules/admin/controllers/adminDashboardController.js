/**
 * Admin Dashboard Controller
 * Handles HTTP requests/responses, delegates business logic to AdminService
 */
const AdminService = require('../services/adminService');
const { successResponse, errorResponse } = require('../../../../helpers/response');

/**
 * Get dashboard statistics
 */
const getDashboardStats = async (req, res, _next) => {
    try {
        const { period = 'week' } = req.query;

        const [stats, error] = await AdminService.getDashboardStats(period);

        if (error) {
            console.error('Error fetching dashboard stats:', error);
            return errorResponse(res, 'Failed to fetch dashboard statistics', 500);
        }

        return successResponse(res, 'Dashboard statistics retrieved successfully', stats);
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return errorResponse(res, 'Failed to fetch dashboard statistics', 500);
    }
};

/**
 * Get revenue analytics
 */
const getRevenueAnalytics = async (req, res, _next) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return errorResponse(res, 'Start date and end date are required', 400);
        }

        const [analytics, error] = await AdminService.getRevenueAnalytics(startDate, endDate);

        if (error) {
            console.error('Error fetching revenue analytics:', error);
            return errorResponse(res, 'Failed to fetch revenue analytics', 500);
        }

        return successResponse(res, 'Revenue analytics retrieved successfully', analytics);
    } catch (error) {
        console.error('Error fetching revenue analytics:', error);
        return errorResponse(res, 'Failed to fetch revenue analytics', 500);
    }
};

/**
 * Get product analytics
 */
const getProductAnalytics = async (req, res, _next) => {
    try {
        const [analytics, error] = await AdminService.getProductAnalytics();

        if (error) {
            console.error('Error fetching product analytics:', error);
            return errorResponse(res, 'Failed to fetch product analytics', 500);
        }

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
