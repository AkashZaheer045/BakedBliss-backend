/**
 * Auth Routes
 * Per QAutos pattern:
 * - No route-level authentication (handled centrally in app.js)
 * - Validation rules via ValidationRules.rule('methodName')
 * - Centralized Validation.validate middleware
 */
const express = require('express');
const authRules = require('../validations/authValidation');
const Validation = require('../../../../utils/validation');

// Controllers
const { signUpUser, signInUser, socialLogin } = require('../controllers/authController');
const { getUserProfile } = require('../../user/controllers/userProfileController');

const routes = function () {
    const router = express.Router({ mergeParams: true });

    //------------------------------------//
    // PUBLIC ROUTES (defined in auth.js allowedPaths)
    //------------------------------------//

    // Sign-up / Register
    router.route('/register').post(authRules.rule('register'), Validation.validate, signUpUser);

    router.route('/signup').post(authRules.rule('signup'), Validation.validate, signUpUser);

    // Sign-in / Login
    router.route('/login').post(authRules.rule('login'), Validation.validate, signInUser);

    // Social login (Google, Facebook, etc.)
    router
        .route('/google-login')
        .post(authRules.rule('googleLogin'), Validation.validate, socialLogin);

    router.route('/social-login').post(socialLogin);

    // Password reset flow
    router
        .route('/forgot-password')
        .post(authRules.rule('forgotPassword'), Validation.validate, signInUser); // Replace with actual forgot password controller

    router
        .route('/reset-password')
        .post(authRules.rule('resetPassword'), Validation.validate, signInUser); // Replace with actual reset password controller

    //------------------------------------//
    // PROTECTED ROUTES (auth handled centrally)
    //------------------------------------//

    // Get user profile (legacy route - maintained for compatibility)
    router.route('/users/profile/:user_id').get(getUserProfile);

    return router;
};

module.exports = routes;
