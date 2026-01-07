/**
 * Validation Middleware
 * Per Node.js Standardization Guide Section 3:
 * Handle express-validator results consistently across the application.
 */
const { validationResult } = require('express-validator');

/**
 * Middleware to check validation results and return errors
 * Use after express-validator validation chains
 *
 * @example
 * router.post('/products',
 *   createProductValidation,
 *   validate,
 *   asyncHandler(controller.createProduct)
 * );
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map(err => ({
            field: err.path || err.param,
            message: err.msg
        }));

        return res.status(422).json({
            status: 'error',
            statusCode: 422,
            message: 'Validation failed',
            errors: formattedErrors
        });
    }

    next();
};

/**
 * Create custom validation error
 * For use in controllers when custom validation is needed
 */
const createValidationError = (field, message) => {
    const error = new Error(message);
    error.type = 'VALIDATION_ERROR';
    error.field = field;
    error.statusCode = 422;
    return error;
};

module.exports = {
    validate,
    createValidationError
};
