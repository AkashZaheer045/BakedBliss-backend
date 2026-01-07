/**
 * Cart Validation Rules
 * Per QAutos pattern: Export rules via rule() method
 */
const { body } = require('express-validator');

const ValidationRules = {};

ValidationRules.rule = method => {
    switch (method) {
        case 'addItem': {
            return [
                body('productId')
                    .notEmpty()
                    .withMessage('Product ID is required')
                    .isInt({ min: 1 })
                    .withMessage('Invalid product ID'),

                body('quantity')
                    .optional()
                    .isInt({ min: 1, max: 100 })
                    .withMessage('Quantity must be between 1 and 100')
            ];
        }

        case 'updateItem': {
            return [
                body('productId')
                    .notEmpty()
                    .withMessage('Product ID is required')
                    .isInt({ min: 1 })
                    .withMessage('Invalid product ID'),

                body('quantity')
                    .notEmpty()
                    .withMessage('Quantity is required')
                    .isInt({ min: 1, max: 100 })
                    .withMessage('Quantity must be between 1 and 100')
            ];
        }

        case 'removeItem': {
            return [
                body('productId')
                    .notEmpty()
                    .withMessage('Product ID is required')
                    .isInt({ min: 1 })
                    .withMessage('Invalid product ID')
            ];
        }

        case 'getCart': {
            return [];
        }

        case 'clearCart': {
            return [];
        }

        default:
            return [];
    }
};

module.exports = ValidationRules;
