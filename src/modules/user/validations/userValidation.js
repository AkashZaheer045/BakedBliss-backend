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
                param('user_id').isInt({ min: 1 }).withMessage('Invalid user ID'),

                body('product_id')
                    .notEmpty()
                    .withMessage('Product ID is required')
                    .isInt({ min: 1 })
                    .withMessage('Invalid product ID')
            ];
        }

        case 'removeFavorite': {
            return [
                param('user_id').isInt({ min: 1 }).withMessage('Invalid user ID'),

                param('product_id').isInt({ min: 1 }).withMessage('Invalid product ID')
            ];
        }

        case 'listFavorites': {
            return [param('user_id').isInt({ min: 1 }).withMessage('Invalid user ID')];
        }

        case 'updateProfile': {
            return [
                body('name')
                    .optional()
                    .trim()
                    .isLength({ min: 2, max: 100 })
                    .withMessage('Name must be between 2 and 100 characters'),

                body('email').optional().isEmail().withMessage('Invalid email format'),

                body('phone')
                    .optional()
                    .matches(/^\+?\d{10,15}$/)
                    .withMessage('Invalid phone number')
            ];
        }

        default:
            return [];
    }
};

module.exports = ValidationRules;
