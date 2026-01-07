/**
 * Admin Controller Tests
 */
const request = require('supertest');

// Mock dependencies
jest.mock('../../src/modules/admin/services/adminService', () => ({
    getDashboardStats: jest.fn(),
    getRevenueAnalytics: jest.fn(),
    getProductAnalytics: jest.fn()
}));

// Mock global auth
jest.mock('../../middleware/auth.js', () => (req, res, next) => {
    req.user = { userId: 'admin_123', role: 'admin' };
    next();
});

// Mock legacy auth middleware used in admin routes
jest.mock('../../middleware/auth_middleware.js', () => (req, res, next) => next());

// Mock role middleware
jest.mock('../../middleware/role_middleware.js', () => ({
    isAdmin: (req, res, next) => next()
}));

const AdminService = require('../../src/modules/admin/services/adminService');

describe('Admin Controller', () => {
    let app;

    beforeAll(() => {
        app = require('../../app');
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/v1/admin/dashboard/stats', () => {
        it('should return dashboard stats', async () => {
            const mockStats = { totalUsers: 100, totalOrders: 50 };
            AdminService.getDashboardStats.mockResolvedValue([mockStats, null]);

            const response = await request(app)
                .get('/api/v1/admin/dashboard/stats')
                .expect(200);

            expect(response.body.status).toBe('success');
            expect(response.body.data).toEqual(mockStats);
        });
    });

    describe('GET /api/v1/admin/analytics/revenue', () => {
        it('should return revenue analytics', async () => {
            const mockAnalytics = { revenue: 5000 };
            AdminService.getRevenueAnalytics.mockResolvedValue([mockAnalytics, null]);

            const response = await request(app)
                .get('/api/v1/admin/analytics/revenue')
                .query({ startDate: '2025-01-01', endDate: '2025-01-31' })
                .expect(200);

            expect(response.body.status).toBe('success');
            expect(response.body.data).toEqual(mockAnalytics);
        });

        it('should return 400 if dates missing', async () => {
            const response = await request(app)
                .get('/api/v1/admin/analytics/revenue')
                .expect(400);

            expect(response.body.status).toBe('error');
            expect(response.body.message).toContain('Start date and end date are required');
        });
    });
});
