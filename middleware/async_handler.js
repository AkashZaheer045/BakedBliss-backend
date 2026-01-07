/**
 * Async Handler Wrapper
 * Wraps async route handlers to catch errors and pass them to the error middleware.
 * Per Node.js Standardization Guide Section 3: Never rely on unhandled promise rejections.
 *
 * Usage:
 * const asyncHandler = require('../../middleware/async_handler');
 * router.get('/products', asyncHandler(controller.getProducts));
 */

const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
