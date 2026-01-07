/**
 * Cart Controller Tests
 */
const request = require('supertest');

// Mock dependencies
jest.mock('../../src/modules/cart/services/cartService', () => ({
    addItemToCart: jest.fn(),
    getCart: jest.fn(),
    updateCartItem: jest.fn(),
    removeItemFromCart: jest.fn(),
    clearCart: jest.fn()
}));

// Mock auth
jest.mock('../../middleware/auth.js', () => (req, res, next) => {
    req.user = { uid: 'user_123' };
    next();
});

const CartService = require('../../src/modules/cart/services/cartService');

describe('Cart Controller', () => {
    let app;

    beforeAll(() => {
        app = require('../../app');
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/v1/cart/add', () => {
        it('should add item to cart', async () => {
            const mockItems = [{ productId: 1, quantity: 2 }];
            CartService.addItemToCart.mockResolvedValue([mockItems, null]);

            const response = await request(app)
                .post('/api/v1/cart/add')
                .send({ productId: 1, quantity: 2 })
                .expect(200);

            expect(response.body.status).toBe('success');
            expect(response.body.cart.items).toHaveLength(1);
        });

        it('should return 412 if validation fails', async () => {
            const response = await request(app)
                .post('/api/v1/cart/add')
                .send({ quantity: 2 }) // Missing productId
                .expect(412);

            expect(response.body.status).toBe('error');
        });
    });

    describe('GET /api/v1/cart/view', () => {
        it('should view cart', async () => {
            const mockCart = { items: [{ productId: 1, quantity: 2 }] };
            CartService.getCart.mockResolvedValue([mockCart, null]);

            const response = await request(app)
                .get('/api/v1/cart/view')
                .expect(200);

            expect(response.body.status).toBe('success');
            expect(response.body.cart.items).toHaveLength(1);
        });
    });

    describe('DELETE /api/v1/cart/remove', () => {
        it('should remove item', async () => {
            CartService.removeItemFromCart.mockResolvedValue([[], null]);

            const response = await request(app)
                .delete('/api/v1/cart/remove')
                .send({ productId: 1 })
                .expect(200);

            expect(response.body.status).toBe('success');
            expect(response.body.cart.items).toHaveLength(0);
        });
    });
});
