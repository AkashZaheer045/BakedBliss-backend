/**
 * User Validation Rules
 * Per QAutos pattern: Export rules via rule() method
 */
const { body, param } = require('express-validator');

const ValidationRules = {};

ValidationRules.rule = method => {
    switch (method) {
        case 'addFavorite': {
            return [
                param('user_id')
                    .exists()
                    .withMessage('User ID is required')
                    .isString()
                    .withMessage('Invalid user ID format'),

                body('productId')
                    .notEmpty()
                    .withMessage('Product ID is required')
                    .isInt({ min: 1 })
                    .withMessage('Invalid product ID')
            ];
        }

        case 'removeFavorite': {
            return [
                param('user_id')
                    .exists()
                    .withMessage('User ID is required')
                    .isString()
                    .withMessage('Invalid user ID format'),

                param('product_id').isInt({ min: 1 }).withMessage('Invalid product ID')
            ];
        }

        case 'listFavorites': {
            return [
                param('user_id')
                    .exists()
                    .withMessage('User ID is required')
                    .isString()
                    .withMessage('Invalid user ID format')
            ];
        }

        case 'updateProfile': {
            return [
                param('user_id')
                    .exists()
                    .withMessage('User ID is required')
                    .isString()
                    .withMessage('Invalid user ID format'),

                body('fullName')
                    .optional()
                    .trim()
                    .isLength({ min: 2, max: 100 })
                    .withMessage('Name must be between 2 and 100 characters'),

                body('phoneNumber')
                    .optional()
                    .matches(/^\+?\d{10,15}$/)
                    .withMessage('Invalid phone number format')
            ];
        }

        default:
            return [];
    }
};

module.exports = ValidationRules;
