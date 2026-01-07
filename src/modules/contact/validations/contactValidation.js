/**
 * Contact Validation Rules
 * Per QAutos pattern: Export rules via rule() method
 */
const { body, query } = require('express-validator');

const ValidationRules = {};

ValidationRules.rule = method => {
    switch (method) {
        case 'submit': {
            return [
                body('name')
                    .trim()
                    .notEmpty()
                    .withMessage('Name is required')
                    .isLength({ min: 2, max: 100 })
                    .withMessage('Name must be between 2 and 100 characters'),

                body('email')
                    .trim()
                    .notEmpty()
                    .withMessage('Email is required')
                    .isEmail()
                    .withMessage('Invalid email format'),

                body('message')
                    .trim()
                    .notEmpty()
                    .withMessage('Message is required')
                    .isLength({ min: 10, max: 2000 })
                    .withMessage('Message must be between 10 and 2000 characters'),

                body('subject')
                    .optional()
                    .trim()
                    .isLength({ max: 200 })
                    .withMessage('Subject must be less than 200 characters')
            ];
        }

        case 'list': {
            return [
                query('page')
                    .optional()
                    .isInt({ min: 1 })
                    .withMessage('Page must be a positive integer'),

                query('limit')
                    .optional()
                    .isInt({ min: 1, max: 100 })
                    .withMessage('Limit must be between 1 and 100')
            ];
        }

        default:
            return [];
    }
};

module.exports = ValidationRules;
