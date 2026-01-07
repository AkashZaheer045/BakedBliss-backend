/**
 * Address Controller Tests
 */
const request = require('supertest');

// Mock service
jest.mock('../../src/modules/address/services/addressService', () => ({
    addAddress: jest.fn(),
    updateAddress: jest.fn(),
    deleteAddress: jest.fn(),
    getAddresses: jest.fn()
}));

// Mock auth middleware
jest.mock('../../middleware/auth.js', () => (req, res, next) => {
    req.user = { userId: 'user_123', email: 'test@example.com' };
    next();
});

const AddressService = require('../../src/modules/address/services/addressService');

describe('Address Controller', () => {
    let app;

    beforeAll(() => {
        app = require('../../app');
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/v1/address/add', () => {
        it('should add address successfully', async () => {
            const mockAddress = {
                id: 1,
                street: '123 Main St',
                city: 'Test City',
                zip_code: '12345'
            };

            AddressService.addAddress.mockResolvedValue([[mockAddress], null]);

            const response = await request(app)
                .post('/api/v1/address/add')
                .send({
                    street: '123 Main St',
                    city: 'Test City',
                    zip_code: '12345'
                })
                .expect(201); // Expect 201 if successful

            // Use message check if status field is not consistent or wrapping is used
            // Controller returns { status: 'success', data: addresses }
            expect(response.body.status).toBe('success');
            expect(response.body.data).toHaveLength(1);
        });

        it('should return 412 if validation fails', async () => {
            const response = await request(app)
                .post('/api/v1/address/add')
                .send({
                    street: '123 Main St'
                    // Missing city and zip
                })
                .expect(412);

            expect(response.body.status).toBe('error');
        });
    });

    describe('GET /api/v1/address/list', () => {
        it('should list addresses', async () => {
            const mockAddresses = [{ id: 1, street: '123 Main St' }];
            AddressService.getAddresses.mockResolvedValue([mockAddresses, null]);

            const response = await request(app)
                .get('/api/v1/address/list')
                .expect(200);

            expect(response.body.status).toBe('success');
            expect(response.body.data).toHaveLength(1);
        });
    });
});
