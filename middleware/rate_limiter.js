/**
 * Rate Limiting Middleware - Baked Bliss
 * Protects API endpoints from abuse and brute-force attacks
 *
 * Uses express-rate-limit with in-memory storage.
 * For production with multiple instances, consider Redis store.
 */

const rateLimit = require('express-rate-limit');

/**
 * Response format for rate limit errors
 */
const createLimitMessage = message => ({
    status: 'error',
    statusCode: 429,
    message,
    data: {}
});

/**
 * Global API rate limiter
 * 100 requests per 15 minutes per IP
 * Applied to all routes
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: createLimitMessage('Too many requests. Please try again in 15 minutes.'),
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false, // Disable X-RateLimit headers
    handler: (req, res, _next, options) => {
        console.log(`[RateLimit] API limit exceeded for IP: ${req.ip}`);
        res.status(options.statusCode).json(options.message);
    }
});

/**
 * Authentication endpoint limiter
 * 5 failed attempts per 15 minutes
 * Applied to login and verify-otp
 * Skips successful requests (200 status)
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit to 5 failed attempts
    message: createLimitMessage('Too many login attempts. Please try again in 15 minutes.'),
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful logins
    handler: (req, res, _next, options) => {
        console.log(`[RateLimit] Auth limit exceeded for: ${req.body?.email || req.ip}`);
        res.status(options.statusCode).json(options.message);
    }
});

/**
 * OTP resend limiter
 * 3 requests per hour
 * Prevents OTP request flooding
 */
const otpLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit to 3 OTP requests per hour
    message: createLimitMessage('Too many OTP requests. Please try again in 1 hour.'),
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, _next, options) => {
        console.log(`[RateLimit] OTP limit exceeded for: ${req.body?.email || req.ip}`);
        res.status(options.statusCode).json(options.message);
    }
});

/**
 * Password reset limiter
 * 3 requests per hour
 * Prevents password reset abuse
 */
const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit to 3 reset requests per hour
    message: createLimitMessage('Too many password reset requests. Please try again in 1 hour.'),
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, _next, options) => {
        console.log(`[RateLimit] Password reset limit exceeded for: ${req.body?.email || req.ip}`);
        res.status(options.statusCode).json(options.message);
    }
});

/**
 * Registration limiter
 * 5 registrations per hour per IP
 * Prevents mass account creation
 */
const registrationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit to 5 registrations per hour
    message: createLimitMessage('Too many registration attempts. Please try again in 1 hour.'),
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, _next, options) => {
        console.log(`[RateLimit] Registration limit exceeded for IP: ${req.ip}`);
        res.status(options.statusCode).json(options.message);
    }
});

/**
 * Strict limiter for sensitive operations
 * 3 requests per 5 minutes
 * Applied to change password, delete account, etc.
 */
const strictLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 3,
    message: createLimitMessage('Too many requests for this operation. Please wait 5 minutes.'),
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, _next, options) => {
        console.log(`[RateLimit] Strict limit exceeded for: ${req.user?.id || req.ip}`);
        res.status(options.statusCode).json(options.message);
    }
});

module.exports = {
    apiLimiter,
    authLimiter,
    otpLimiter,
    passwordResetLimiter,
    registrationLimiter,
    strictLimiter
};
