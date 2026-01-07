/**
 * Auth Routes - Baked Bliss
 * Per QAutos pattern:
 * - No route-level authentication (handled centrally in app.js)
 * - Validation rules via ValidationRules.rule('methodName')
 * - Centralized Validation.validate middleware
 * - Rate limiting on sensitive endpoints
 */
const express = require('express');
const authRules = require('../validations/authValidation');
const Validation = require('../../../../utils/validation');
const { authLimiter, otpLimiter, passwordResetLimiter, registrationLimiter } = require('../../../../middleware/rate_limiter');

// Controllers
const {
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
} = require('../controllers/authController');

const { getUserProfile } = require('../../user/controllers/userProfileController');

const routes = function () {
    const router = express.Router({ mergeParams: true });

    //------------------------------------//
    // PUBLIC ROUTES (defined in auth.js allowedPaths)
    //------------------------------------//

    // Sign-up / Register
    router
        .route('/register')
        .post(registrationLimiter, authRules.rule('register'), Validation.validate, signUpUser);

    router
        .route('/signup')
        .post(registrationLimiter, authRules.rule('signup'), Validation.validate, signUpUser);

    // Sign-in / Login (direct - no OTP)
    router.route('/login').post(authLimiter, authRules.rule('login'), Validation.validate, signInUser);

    // Sign-in with OTP (2FA)
    router.route('/login-otp').post(authLimiter, authRules.rule('login'), Validation.validate, signInWithOTP);

    // OTP Verification
    router.route('/verify-otp').post(authLimiter, authRules.rule('verifyOtp'), Validation.validate, verifyOTP);

    // Resend OTP
    router.route('/resend-otp').post(otpLimiter, authRules.rule('resendOtp'), Validation.validate, resendOTP);

    // Social login (Google, Facebook, etc.)
    router.route('/google-login').post(authRules.rule('googleLogin'), Validation.validate, socialLogin);

    router.route('/social-login').post(socialLogin);

    // Password reset flow
    router
        .route('/forgot-password')
        .post(passwordResetLimiter, authRules.rule('forgotPassword'), Validation.validate, forgotPassword);

    router
        .route('/reset-password')
        .post(passwordResetLimiter, authRules.rule('resetPassword'), Validation.validate, resetPassword);

    // Token refresh (public - uses refresh token for auth)
    router.route('/refresh-token').post(refreshToken);

    // Logout
    router.route('/logout').post(logout);

    //------------------------------------//
    // PROTECTED ROUTES (auth handled centrally)
    //------------------------------------//

    // Change password (requires authentication)
    router.route('/change-password').post(authRules.rule('changePassword'), Validation.validate, changePassword);

    // Get user profile (legacy route - maintained for compatibility)
    router.route('/users/profile/:user_id').get(getUserProfile);

    return router;
};

module.exports = routes;

