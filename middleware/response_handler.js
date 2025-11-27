/**
 * Centralized Response Handler Middleware
 * Maps custom errors to HTTP responses
 */

const customExceptions = require('../utils/custom_exceptions.json');

/**
 * Error handling middleware
 * Should be registered last in the middleware chain
 */
const errorHandler = (err, req, res, next) => {
    // Log the error for debugging
    console.error('Error:', {
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });

    // Check if error matches custom exception
    let statusCode = err.statusCode || 500;
    let errorCode = err.code || 'INTERNAL_ERROR';
    let message = err.message || 'Internal server error';

    // Map known custom exceptions
    Object.keys(customExceptions).forEach((exceptionName) => {
        if (err.name === exceptionName || err.code === customExceptions[exceptionName].code) {
            statusCode = customExceptions[exceptionName].statusCode;
            errorCode = customExceptions[exceptionName].code;
            message = err.message || customExceptions[exceptionName].message;
        }
    });

    // Handle Sequelize errors
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
        statusCode = 422;
        errorCode = 'VALIDATION_ERROR';
        message = err.errors ? err.errors.map((e) => e.message).join(', ') : err.message;
    }

    if (err.name === 'SequelizeDatabaseError') {
        statusCode = 500;
        errorCode = 'DATABASE_ERROR';
        message = process.env.NODE_ENV === 'production' ? 'Database error occurred' : err.message;
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        statusCode = 401;
        errorCode = 'INVALID_TOKEN';
        message = err.message;
    }

    // Send error response
    return res.status(statusCode).json({
        success: false,
        errors: [
            {
                code: errorCode,
                message,
            },
        ],
        meta: {
            timestamp: new Date().toISOString(),
            path: req.path,
        },
    });
};

/**
 * 404 Not Found handler
 * Should be registered before the error handler
 */
const notFoundHandler = (req, res, next) => {
    return res.status(404).json({
        success: false,
        errors: [
            {
                code: 'NOT_FOUND',
                message: `Route ${req.method} ${req.path} not found`,
            },
        ],
        meta: {
            timestamp: new Date().toISOString(),
            path: req.path,
        },
    });
};

module.exports = {
    errorHandler,
    notFoundHandler,
};
