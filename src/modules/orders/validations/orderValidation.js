/**
 * Order Validation Rules
 * Per QAutos pattern: Export rules via rule() method
 */
const { body, param, query } = require('express-validator');

const ValidationRules = {};

ValidationRules.rule = method => {
    switch (method) {
        case 'create': {
            return [
                body('delivery_address')
                    .notEmpty()
                    .withMessage('Delivery address is required')
                    .isObject()
                    .withMessage('Delivery address must be an object'),

                body('delivery_address.street')
                    .notEmpty()
                    .withMessage('Street address is required'),

                body('delivery_address.city').notEmpty().withMessage('City is required'),

                body('delivery_address.state').optional().isAlpha().withMessage('State is required'),

                body('delivery_address.zip_code').notEmpty().isNumeric().withMessage('ZIP code is required'),

                body('delivery_address.country').optional().default('Pakistan').isString().withMessage('Country is required'),

                body('payment_method')
                    .optional()
                    .isIn(['cash', 'card', 'online'])
                    .withMessage('Invalid payment method')
            ];
        }

        case 'getById': {
            return [param('orderId').isString().withMessage('Invalid order ID')];
        }

        case 'list': {
            return [
                query('page')
                    .optional()
                    .isInt({ min: 1 })
                    .withMessage('Page must be a positive integer'),

                query('limit')
                    .optional()
                    .isInt({ min: 1, max: 50 })
                    .withMessage('Limit must be between 1 and 50'),

                query('status')
                    .optional()
                    .isIn([
                        'pending',
                        'confirmed',
                        'preparing',
                        'out_for_delivery',
                        'delivered',
                        'cancelled'
                    ])
                    .withMessage('Invalid order status')
            ];
        }

        case 'updateStatus': {
            return [
                body('order_id').isString().withMessage('Invalid order ID'),

                body('status')
                    .notEmpty()
                    .withMessage('Status is required')
                    .isIn([
                        'pending',
                        'confirmed',
                        'preparing',
                        'out_for_delivery',
                        'delivered',
                        'cancelled'
                    ])
                    .withMessage('Invalid order status')
            ];
        }

        case 'cancel': {
            return [
                param('orderId').isString().withMessage('Invalid order ID'),

                body('reason')
                    .optional()
                    .isLength({ max: 500 })
                    .withMessage('Reason must be less than 500 characters')
            ];
        }

        default:
            return [];
    }
};

module.exports = ValidationRules;
