/**
 * Auth Controller Tests
 */
const request = require('supertest');

// Mock the service before requiring the app
const mockAuthService = {
    signUp: jest.fn(),
    signIn: jest.fn(),
    socialLogin: jest.fn()
};

jest.mock('../../src/modules/auth/services/authService', () => mockAuthService);

const AuthService = require('../../src/modules/auth/services/authService');

describe('Auth Controller', () => {
    let app;

    beforeAll(() => {
        app = require('../../app');
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/v1/auth/register', () => {
        it('should register a new user successfully', async () => {
            const mockUser = {
                user: {
                    userId: 'user_123',
                    fullName: 'Test User',
                    email: 'test@example.com',
                    role: 'user'
                },
                token: 'mock_token'
            };

            AuthService.signUp.mockResolvedValue([mockUser, null]);

            const response = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    fullName: 'Test User',
                    email: 'test@example.com',
                    password: 'Password123'
                })
                .expect(201);

            expect(response.body.message).toBe('success');
            expect(response.body.data.email).toBe(mockUser.user.email);
            expect(response.body.token).toBe(mockUser.token);
        });

        it('should return 412 if validation fails', async () => {
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    // Missing required fields
                    password: '123'
                })
                .expect(412);

            expect(response.body.status).toBe('error');
        });

        it('should return error if email already exists', async () => {
            AuthService.signUp.mockResolvedValue([
                null,
                { status: 409, message: 'User already exists' }
            ]);

            const response = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    fullName: 'Existing User',
                    email: 'existing@example.com',
                    password: 'Password123'
                })
                .expect(409);

            expect(response.body.message).toBe('failed');
            expect(response.body.error).toContain('User already exists');
        });
    });

    describe('POST /api/v1/auth/login', () => {
        it('should login user successfully', async () => {
            const mockUser = {
                user: {
                    userId: 'user_123',
                    email: 'test@example.com'
                },
                token: 'mock_token'
            };

            AuthService.signIn.mockResolvedValue([mockUser, null]);

            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'Password123'
                })
                .expect(200);

            expect(response.body.message).toBe('success');
            expect(response.body.token).toBe(mockUser.token);
        });

        it('should return 401 for invalid credentials', async () => {
            AuthService.signIn.mockResolvedValue([
                null,
                { status: 401, message: 'Invalid password' }
            ]);

            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword'
                })
                .expect(401);

            expect(response.body.message).toBe('failed');
        });
    });
});
