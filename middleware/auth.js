/**
 * Authentication Middleware - Centralized Auth Handler
 * Per QAutos pattern: Handles public/private routes using allowedPaths array
 * No need for route-level authentication
 */
const sequelize = require('../db/sequelize/sequelize');
const jwt = require('jsonwebtoken');

// Support both JWT_SECRET_KEY and JWT_SECRET for compatibility
const jwtSecretKey = process.env.JWT_SECRET_KEY || process.env.JWT_SECRET || 'your-default-secret-key';

/**
 * Public paths that don't require authentication
 * Add new public endpoints here
 */
const allowedPaths = [
    // Auth routes - public
    '/api/v1/auth/login',
    '/api/v1/auth/login-otp',
    '/api/v1/auth/register',
    '/api/v1/auth/signup',
    '/api/v1/auth/verify-otp',
    '/api/v1/auth/resend-otp',
    '/api/v1/auth/forgot-password',
    '/api/v1/auth/reset-password',
    '/api/v1/auth/google-login',
    '/api/v1/auth/social-login',
    '/api/v1/auth/refresh-token',
    '/api/v1/auth/logout',

    // Products - public browsing
    '/api/v1/products',
    '/api/v1/products/search',
    '/api/v1/products/categories',
    '/api/v1/products/trending',

    // Contact - public
    '/api/v1/contact',
    '/api/v1/contact/submit',

    // Health check
    '/user/health',
    '/health'
];

/**
 * Path prefixes that are public (for dynamic routes like /products/:id)
 */
const allowedPrefixes = [
    '/api/v1/products/category/',
    '/api/v1/products/' // For product details by ID
];

/**
 * Check if path matches any allowed path or prefix
 */
const isPublicPath = path => {
    // Check exact matches
    if (allowedPaths.includes(path)) {
        return true;
    }

    // Check prefix matches (for dynamic routes)
    for (const prefix of allowedPrefixes) {
        if (path.startsWith(prefix)) {
            // For product details, only allow GET requests
            // Additional logic can be added here
            return true;
        }
    }

    return false;
};

/**
 * Main authentication middleware
 * Applied globally in app.js - no need for route-level auth
 */
module.exports = async function (req, res, next) {
    // Remove query params for path matching
    const cleanPath = req.path.split('?')[0];

    console.log(`[Auth] Checking path: ${cleanPath}`);

    // Allow public paths without authentication
    if (isPublicPath(cleanPath)) {
        console.log(`[Auth] Public path - allowing without auth`);
        return next();
    }

    // Get token from headers
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    if (!token) {
        return res.status(401).json({
            status: 'error',
            statusCode: 401,
            message: 'No token provided. Authentication required.'
        });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, jwtSecretKey);

        // Debug: log decoded token
        console.log('[Auth] Decoded token:', { uid: decoded.uid, id: decoded.id, user_id: decoded.user_id });

        // Get user from database - token uses 'uid' field which contains user_id string
        const userId = decoded.uid || decoded.id || decoded.user_id;

        const user = await sequelize.models.users.findOne({
            where: { user_id: userId },
            attributes: { exclude: ['password', 'deleted_at'] }
        });

        if (!user) {
            console.log('[Auth] User not found for userId:', userId);
            return res.status(401).json({
                status: 'error',
                statusCode: 401,
                message: 'User not found'
            });
        }

        // Check user status
        if (user.status && user.status !== 'active') {
            return res.status(401).json({
                status: 'error',
                statusCode: 401,
                message: 'User account is suspended or inactive. Please contact support.'
            });
        }

        // Attach user to request
        req.user = user;
        req.userId = user.id;

        console.log(`[Auth] User authenticated: ${user.id}`);
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                status: 'error',
                statusCode: 401,
                message: 'Your session has expired. Please log in again.'
            });
        }

        return res.status(401).json({
            status: 'error',
            statusCode: 401,
            message: 'Invalid authentication token'
        });
    }
};

// Export the allowed paths for reference
module.exports.allowedPaths = allowedPaths;
module.exports.allowedPrefixes = allowedPrefixes;
module.exports.isPublicPath = isPublicPath;
