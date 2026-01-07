/**
 * Standard success response helper
 */
const successResponse = (res, message = 'Success', data = null, statusCode = 200) => {
    const response = {
        success: true,
        status: 'success',
        message
    };

    if (data !== null) {
        response.data = data;
    }

    return res.status(statusCode).json(response);
};

/**
 * Standard error response helper
 */
const errorResponse = (res, message = 'An error occurred', statusCode = 500, errors = null) => {
    const response = {
        success: false,
        status: 'error',
        message
    };

    if (errors) {
        response.errors = errors;
    }

    return res.status(statusCode).json(response);
};

/**
 * Validation error response helper
 */
const validationErrorResponse = (res, errors) => {
    return res.status(400).json({
        success: false,
        status: 'error',
        message: 'Validation error',
        errors
    });
};

/**
 * Not found response helper
 */
const notFoundResponse = (res, message = 'Resource not found') => {
    return res.status(404).json({
        success: false,
        status: 'error',
        message
    });
};

/**
 * Unauthorized response helper
 */
const unauthorizedResponse = (res, message = 'Unauthorized access') => {
    return res.status(401).json({
        success: false,
        status: 'error',
        message
    });
};

/**
 * Forbidden response helper
 */
const forbiddenResponse = (res, message = 'Access forbidden') => {
    return res.status(403).json({
        success: false,
        status: 'error',
        message
    });
};

module.exports = {
    successResponse,
    errorResponse,
    validationErrorResponse,
    notFoundResponse,
    unauthorizedResponse,
    forbiddenResponse
};
