const express = require('express');
const { signUpUser, signInUser, socialLogin } = require('../controllers/authController');
const { getUserProfile } = require('../../user/controllers/userProfileController');
const authenticateToken = require('../../../../middleware/authMiddleware.js');

let routes = function () {
    const router = express.Router({ mergeParams: true });

    // Route for sign-up
    router.post('/users/register', signUpUser);

    // Route for sign-in
    router.post('/users/signin', signInUser);

    // Route for social login (Facebook, Google, etc.)
    router.post('/users/social-login', socialLogin);

    // Route for getting user profile (protected)
    router.get('/users/profile/:user_id', authenticateToken, getUserProfile);

    return router;
};

module.exports = routes;
