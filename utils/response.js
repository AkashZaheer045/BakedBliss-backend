/**
 * Standardized response helpers
 * Ensures consistent API response shape: { success, data, errors, meta }
 */

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {Object} meta - Optional metadata (pagination, etc.)
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const sendSuccess = (res, data = null, meta = {}, statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        data,
        meta,
    });
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {string|Array} errors - Error message(s)
 * @param {number} statusCode - HTTP status code (default: 400)
 * @param {Object} meta - Optional metadata
 */
const sendError = (res, errors, statusCode = 400, meta = {}) => {
    const errorArray = Array.isArray(errors) ? errors : [errors];

    return res.status(statusCode).json({
        success: false,
        errors: errorArray,
        meta,
    });
};

/**
 * Send paginated success response
 * @param {Object} res - Express response object
 * @param {Array} data - Response data array
 * @param {Object} pagination - Pagination info { page, limit, total, totalPages }
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const sendPaginatedSuccess = (res, data, pagination, statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        data,
        meta: {
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                total: pagination.total,
                totalPages: pagination.totalPages,
            },
        },
    });
};

/**
 * Send created response (201)
 * @param {Object} res - Express response object
 * @param {*} data - Created resource data
 * @param {Object} meta - Optional metadata
 */
const sendCreated = (res, data, meta = {}) => {
    return sendSuccess(res, data, meta, 201);
};

/**
 * Send no content response (204)
 * @param {Object} res - Express response object
 */
const sendNoContent = (res) => {
    return res.status(204).send();
};

/**
 * Send unauthorized error (401)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const sendUnauthorized = (res, message = 'Unauthorized') => {
    return sendError(res, message, 401);
};

/**
 * Send forbidden error (403)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const sendForbidden = (res, message = 'Forbidden') => {
    return sendError(res, message, 403);
};

/**
 * Send not found error (404)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const sendNotFound = (res, message = 'Resource not found') => {
    return sendError(res, message, 404);
};

/**
 * Send validation error (422)
 * @param {Object} res - Express response object
 * @param {Array} errors - Validation errors
 */
const sendValidationError = (res, errors) => {
    return sendError(res, errors, 422);
};

/**
 * Send internal server error (500)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const sendInternalError = (res, message = 'Internal server error') => {
    return sendError(res, message, 500);
};

module.exports = {
    sendSuccess,
    sendError,
    sendPaginatedSuccess,
    sendCreated,
    sendNoContent,
    sendUnauthorized,
    sendForbidden,
    sendNotFound,
    sendValidationError,
    sendInternalError,
};
