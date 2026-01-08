/**
 * Auth Controller - Baked Bliss
 * Handles HTTP requests/responses, delegates business logic to AuthService
 * Endpoints: signup, login, verify-otp, resend-otp, forgot-password, reset-password, refresh-token, change-password
 */
const AuthService = require('../services/authService');

/**
 * Helper to send error response
 */
const sendError = (res, error, defaultMessage = 'An error occurred') => {
    const status = error.status || error.statusCode || 500;
    const message = error.message || defaultMessage;
    return res.status(status).json({
        status: 'error',
        statusCode: status,
        message,
        data: {}
    });
};

/**
 * Helper to send success response
 */
const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
        status: 'success',
        statusCode,
        message,
        data
    });
};

/**
 * POST /auth/signup
 * POST /auth/register
 * Register a new user
 */
const signUpUser = async (req, res) => {
    try {
        const { fullName, email, password, profilePicture, addresses, selectedAddressId, phoneNumber, role } =
            req.body;

        const [result, error] = await AuthService.signUp({
            fullName,
            email,
            password,
            profilePicture,
            addresses,
            selectedAddressId,
            phoneNumber,
            role
        });

        if (error) {
            console.error('[Auth] Signup error:', error.message);
            return sendError(res, error, 'An error occurred during signup');
        }

        return sendSuccess(
            res,
            {
                user: result.user,
                accessToken: result.accessToken,
                refreshToken: result.refreshToken
            },
            'User registered successfully',
            201
        );
    } catch (error) {
        console.error('[Auth] Signup exception:', error);
        return sendError(res, { status: 500, message: 'An error occurred during signup' });
    }
};

/**
 * POST /auth/login
 * Sign in user - returns tokens directly (no OTP)
 */
const signInUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [result, error] = await AuthService.signIn(email, password);

        if (error) {
            console.error('[Auth] Login error:', error.message);
            return sendError(res, error, 'An error occurred during login');
        }

        return sendSuccess(
            res,
            {
                user: result.user,
                accessToken: result.accessToken,
                refreshToken: result.refreshToken
            },
            'Login successful'
        );
    } catch (error) {
        console.error('[Auth] Login exception:', error);
        return sendError(res, { status: 500, message: 'An error occurred during login' });
    }
};

/**
 * POST /auth/login-otp
 * Sign in user with OTP - sends OTP to email
 */
const signInWithOTP = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [result, error] = await AuthService.signInWithOTP(email, password);

        if (error) {
            console.error('[Auth] OTP login error:', error.message);
            return sendError(res, error, 'An error occurred during login');
        }

        return sendSuccess(res, result, 'OTP sent to your email');
    } catch (error) {
        console.error('[Auth] OTP login exception:', error);
        return sendError(res, { status: 500, message: 'An error occurred during login' });
    }
};

/**
 * POST /auth/verify-otp
 * Verify OTP and complete login
 */
const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const [result, error] = await AuthService.verifyOTPAndLogin(email, otp);

        if (error) {
            console.error('[Auth] OTP verification error:', error.message);
            return sendError(res, error, 'OTP verification failed');
        }

        return sendSuccess(
            res,
            {
                user: result.user,
                accessToken: result.accessToken,
                refreshToken: result.refreshToken
            },
            'Login successful'
        );
    } catch (error) {
        console.error('[Auth] OTP verification exception:', error);
        return sendError(res, { status: 500, message: 'An error occurred during OTP verification' });
    }
};

/**
 * POST /auth/resend-otp
 * Resend OTP to email
 */
const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        const [result, error] = await AuthService.resendOTP(email);

        if (error) {
            console.error('[Auth] Resend OTP error:', error.message);
            return sendError(res, error, 'Failed to resend OTP');
        }

        return sendSuccess(res, result, 'OTP sent successfully');
    } catch (error) {
        console.error('[Auth] Resend OTP exception:', error);
        return sendError(res, { status: 500, message: 'An error occurred while resending OTP' });
    }
};

/**
 * POST /auth/forgot-password
 * Request password reset email
 */
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const [result, error] = await AuthService.requestPasswordReset(email);

        if (error) {
            console.error('[Auth] Forgot password error:', error.message);
            return sendError(res, error, 'Failed to process password reset request');
        }

        return sendSuccess(res, { email: result.email }, result.message);
    } catch (error) {
        console.error('[Auth] Forgot password exception:', error);
        return sendError(res, { status: 500, message: 'An error occurred' });
    }
};

/**
 * POST /auth/reset-password
 * Reset password with token
 */
const resetPassword = async (req, res) => {
    try {
        const { email, token, password } = req.body;

        const [result, error] = await AuthService.resetPassword(email, token, password);

        if (error) {
            console.error('[Auth] Reset password error:', error.message);
            return sendError(res, error, 'Failed to reset password');
        }

        return sendSuccess(res, {}, result.message);
    } catch (error) {
        console.error('[Auth] Reset password exception:', error);
        return sendError(res, { status: 500, message: 'An error occurred while resetting password' });
    }
};

/**
 * POST /auth/refresh-token
 * Get new access token using refresh token
 */
const refreshToken = async (req, res) => {
    try {
        const { refreshToken: token } = req.body;

        const [result, error] = await AuthService.refreshAccessToken(token);

        if (error) {
            console.error('[Auth] Token refresh error:', error.message);
            return sendError(res, error, 'Failed to refresh token');
        }

        return sendSuccess(
            res,
            {
                accessToken: result.accessToken,
                user: result.user
            },
            'Token refreshed successfully'
        );
    } catch (error) {
        console.error('[Auth] Token refresh exception:', error);
        return sendError(res, { status: 500, message: 'An error occurred while refreshing token' });
    }
};

/**
 * POST /auth/change-password
 * Change password for authenticated user
 */
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user?.user_id || req.userId;

        if (!userId) {
            return sendError(res, { status: 401, message: 'Authentication required' });
        }

        const [result, error] = await AuthService.changePassword(userId, currentPassword, newPassword);

        if (error) {
            console.error('[Auth] Change password error:', error.message);
            return sendError(res, error, 'Failed to change password');
        }

        return sendSuccess(res, {}, result.message);
    } catch (error) {
        console.error('[Auth] Change password exception:', error);
        return sendError(res, { status: 500, message: 'An error occurred while changing password' });
    }
};

/**
 * POST /auth/google-login
 * Social login with Google
 */
const socialLogin = async (req, res) => {
    try {
        const { userId, fullName, email, profilePicture, addresses, selectedAddressId, phoneNumber, pushToken } =
            req.body;

        if (!userId || !fullName) {
            return sendError(res, { status: 400, message: 'userId and fullName are required' });
        }

        const [result, error] = await AuthService.socialLogin({
            userId,
            fullName,
            email,
            profilePicture,
            addresses,
            selectedAddressId,
            phoneNumber,
            pushToken
        });

        if (error) {
            console.error('[Auth] Social login error:', error.message);
            return sendError(res, error, 'An error occurred during social login');
        }

        const statusCode = result.isNew ? 201 : 200;
        const message = result.isNew ? 'Account created successfully' : 'Login successful';

        return sendSuccess(
            res,
            {
                user: result.user,
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
                isNew: result.isNew
            },
            message,
            statusCode
        );
    } catch (error) {
        console.error('[Auth] Social login exception:', error);
        return sendError(res, { status: 500, message: 'An error occurred during social login' });
    }
};

/**
 * POST /auth/logout
 * Logout user (client-side token invalidation)
 */
const logout = async (req, res) => {
    // For JWT-based auth, logout is typically handled client-side by removing tokens
    // Server-side token blacklisting would require Redis or database storage
    return sendSuccess(res, {}, 'Logged out successfully');
};

module.exports = {
    signUpUser,
    signInUser,
    signInWithOTP,
    verifyOTP,
    resendOTP,
    forgotPassword,
    resetPassword,
    refreshToken,
    changePassword,
    socialLogin,
    logout
};
