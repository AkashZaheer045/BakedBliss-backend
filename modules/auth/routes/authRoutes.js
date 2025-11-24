const express = require('express');
const { signUpUser, signInUser, socialLogin } = require('../controllers/authController');
const { getUserProfile } = require('../../user/controllers/userProfileController'); // Import getUserProfile
const verifyFirebaseToken = require('../../../middleware/authMiddleware.js'); // Import middleware for token verification
const router = express.Router();

// Route for sign-up
router.post('/users/register', signUpUser);

// Route for sign-in
router.post('/users/signin', signInUser);

// Route for social login (Facebook, Google, etc.)
router.post('/users/social-login', socialLogin);

// Route for getting user profile (protected)
router.get('/users/profile/:user_id', verifyFirebaseToken, getUserProfile); // Apply token verification

module.exports = router;
