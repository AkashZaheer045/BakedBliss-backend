/**
 * Centralized Validation Utility
 * Per QAutos pattern: Single validate middleware used across all routes
 * Usage: routes.route("/signup").post(rules.rule('signup'), Validation.validate, controller.action)
 */
const { validationResult } = require('express-validator');

/**
 * Validate express-validator results and pass errors to error handler
 */
exports.validate = (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            const firstError = errors.array()[0];
            const field = firstError.path || firstError.param;
            const msg = firstError.msg;

            // Create typed error based on validation message
            let errorMessage;

            switch (msg) {
                case 'Invalid value':
                    errorMessage = `Invalid value for ${field}`;
                    break;
                case 'required':
                    errorMessage = `${field} is required`;
                    break;
                case 'string':
                    errorMessage = `${field} should be a string`;
                    break;
                case 'int':
                    errorMessage = `${field} should be a number`;
                    break;
                case 'array':
                    errorMessage = `${field} should be an array`;
                    break;
                case 'invalid_value':
                    errorMessage = `Invalid value for ${field}`;
                    break;
                case 'length_limit_exceeded':
                    errorMessage = `Invalid length for ${field}`;
                    break;
                default:
                    errorMessage = msg;
            }

            // Pass to error handler
            const err = new TypeError(errorMessage);
            err.statusCode = 422;
            err.type = 'VALIDATION_ERROR';
            err.field = field;
            return next(err);
        }

        next();
    } catch (_err) {
        console.error('[Validation] Error:', _err);
        const returnObj = {
            status: 'error',
            statusCode: 500,
            message: 'Validation processing error',
            error: _err.message
        };
        return res.status(500).json(returnObj);
    }
};

/**
 * Validate and return errors directly (alternative method)
 */
exports.validateWithResponse = (req, res, next) => {
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
