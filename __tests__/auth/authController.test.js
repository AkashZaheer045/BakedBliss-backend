/**
 * Auth Controller Tests
 * Updated to match new response format and password requirements
 */
const request = require('supertest');

// Mock the service before requiring the app
const mockAuthService = {
    signUp: jest.fn(),
    signIn: jest.fn(),
    signInWithOTP: jest.fn(),
    verifyOTPAndLogin: jest.fn(),
    resendOTP: jest.fn(),
    requestPasswordReset: jest.fn(),
    resetPassword: jest.fn(),
    refreshAccessToken: jest.fn(),
    changePassword: jest.fn(),
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
                accessToken: 'mock_access_token',
                refreshToken: 'mock_refresh_token'
            };

            AuthService.signUp.mockResolvedValue([mockUser, null]);

            const response = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    fullName: 'Test User',
                    email: 'test@example.com',
                    password: 'Password123!' // Added special character
                })
                .expect(201);

            expect(response.body.status).toBe('success');
            expect(response.body.data.user.email).toBe(mockUser.user.email);
            expect(response.body.data.accessToken).toBe(mockUser.accessToken);
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
                    password: 'Password123!' // Added special character
                })
                .expect(409);

            expect(response.body.status).toBe('error');
            expect(response.body.message).toContain('User already exists');
        });
    });

    describe('POST /api/v1/auth/login', () => {
        it('should login user successfully', async () => {
            const mockUser = {
                user: {
                    userId: 'user_123',
                    email: 'test@example.com'
                },
                accessToken: 'mock_access_token',
                refreshToken: 'mock_refresh_token'
            };

            AuthService.signIn.mockResolvedValue([mockUser, null]);

            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'Password123!'
                })
                .expect(200);

            expect(response.body.status).toBe('success');
            expect(response.body.message).toBe('Login successful');
            expect(response.body.data.accessToken).toBe(mockUser.accessToken);
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

            expect(response.body.status).toBe('error');
            expect(response.body.message).toBe('Invalid password');
        });
    });

    describe('POST /api/v1/auth/verify-otp', () => {
        it('should verify OTP and return tokens', async () => {
            const mockResult = {
                user: { userId: 'user_123', email: 'test@example.com' },
                accessToken: 'mock_access_token',
                refreshToken: 'mock_refresh_token'
            };

            AuthService.verifyOTPAndLogin.mockResolvedValue([mockResult, null]);

            const response = await request(app)
                .post('/api/v1/auth/verify-otp')
                .send({
                    email: 'test@example.com',
                    otp: '123456'
                })
                .expect(200);

            expect(response.body.status).toBe('success');
            expect(response.body.data.accessToken).toBeDefined();
        });

        it('should return 400 for invalid OTP', async () => {
            AuthService.verifyOTPAndLogin.mockResolvedValue([
                null,
                { status: 400, message: 'Invalid OTP' }
            ]);

            const response = await request(app)
                .post('/api/v1/auth/verify-otp')
                .send({
                    email: 'test@example.com',
                    otp: '000000'
                })
                .expect(400);

            expect(response.body.status).toBe('error');
        });
    });

    describe('POST /api/v1/auth/refresh-token', () => {
        it('should refresh access token', async () => {
            const mockResult = {
                accessToken: 'new_access_token',
                user: { userId: 'user_123' }
            };

            AuthService.refreshAccessToken.mockResolvedValue([mockResult, null]);

            const response = await request(app)
                .post('/api/v1/auth/refresh-token')
                .send({
                    refreshToken: 'valid_refresh_token'
                })
                .expect(200);

            expect(response.body.status).toBe('success');
            expect(response.body.data.accessToken).toBe('new_access_token');
        });

        it('should return 401 for expired refresh token', async () => {
            AuthService.refreshAccessToken.mockResolvedValue([
                null,
                { status: 401, message: 'Refresh token expired' }
            ]);

            const response = await request(app)
                .post('/api/v1/auth/refresh-token')
                .send({
                    refreshToken: 'expired_token'
                })
                .expect(401);

            expect(response.body.status).toBe('error');
        });
    });

    describe('POST /api/v1/auth/forgot-password', () => {
        it('should send password reset email', async () => {
            AuthService.requestPasswordReset.mockResolvedValue([
                { email: 'test@example.com', message: 'Password reset email sent' },
                null
            ]);

            const response = await request(app)
                .post('/api/v1/auth/forgot-password')
                .send({
                    email: 'test@example.com'
                })
                .expect(200);

            expect(response.body.status).toBe('success');
        });
    });
});
