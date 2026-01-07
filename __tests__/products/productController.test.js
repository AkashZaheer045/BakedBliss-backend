/**
 * Product Controller Tests
 * Per Node.js Standardization Guide Section 9:
 * Every new module must ship with controller and service tests covering success and failure paths.
 */

const request = require('supertest');

// Mock the service before requiring the app
jest.mock('../../src/modules/products/services/productService', () => ({
    listProducts: jest.fn(),
    getProductById: jest.fn(),
    searchProducts: jest.fn(),
    getCategories: jest.fn()
}));

const ProductService = require('../../src/modules/products/services/productService');

describe('Product Controller', () => {
    let app;

    beforeAll(() => {
        // Import app after mocks are set up
        app = require('../../app');
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/v1/products', () => {
        it('should return list of products with pagination', async () => {
            const mockProducts = [
                { id: 1, title: 'Test Product 1', price: 10.99 },
                { id: 2, title: 'Test Product 2', price: 15.99 }
            ];

            ProductService.listProducts.mockResolvedValue([
                { products: mockProducts, pagination: { total: 2 } },
                null
            ]);

            const response = await request(app).get('/api/v1/products').expect(200);

            expect(response.body.status).toBe('success');
            expect(response.body.data).toHaveLength(2);
            expect(response.body.pagination).toBeDefined();
        });

        it('should handle errors gracefully', async () => {
            ProductService.listProducts.mockResolvedValue([
                null,
                { status: 500, message: 'Database error' }
            ]);

            const response = await request(app).get('/api/v1/products').expect(500);

            expect(response.body.status).toBe('error');
        });
    });

    describe('GET /api/v1/products/:product_id', () => {
        it('should return product by ID', async () => {
            const mockProduct = { id: 1, title: 'Test Product', price: 10.99 };

            ProductService.getProductById.mockResolvedValue([mockProduct, null]);

            const response = await request(app).get('/api/v1/products/1').expect(200);

            expect(response.body.status).toBe('success');
            expect(response.body.data).toEqual(mockProduct);
        });

        it('should return 404 for non-existent product', async () => {
            ProductService.getProductById.mockResolvedValue([
                null,
                { status: 404, message: 'Product not found' }
            ]);

            const response = await request(app).get('/api/v1/products/999').expect(404);

            expect(response.body.status).toBe('error');
        });
    });

    describe('GET /api/v1/products/search', () => {
        it('should search products by query', async () => {
            const mockProducts = [{ id: 1, title: 'Chocolate Cake', price: 25.99 }];

            ProductService.searchProducts.mockResolvedValue([mockProducts, null]);

            const response = await request(app)
                .get('/api/v1/products/search')
                .query({ query: 'chocolate' })
                .expect(200);

            expect(response.body.status).toBe('success');
            expect(response.body.data).toHaveLength(1);
        });

        it('should return 412 when query is missing', async () => {
            const response = await request(app).get('/api/v1/products/search').expect(412);

            expect(response.body.status).toBe('error');
            expect(response.body.message).toContain('Search query is required');
        });

        it('should return 404 when no products found', async () => {
            ProductService.searchProducts.mockResolvedValue([[], null]);

            const response = await request(app)
                .get('/api/v1/products/search')
                .query({ query: 'nonexistent' })
                .expect(404);

            expect(response.body.status).toBe('error');
        });
    });
});
