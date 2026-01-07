/**
 * Address Validation Rules
 * Per QAutos pattern: Export rules via rule() method
 */
const { body } = require('express-validator');

const ValidationRules = {};

ValidationRules.rule = method => {
    switch (method) {
        case 'add': {
            return [
                body('street').trim().notEmpty().withMessage('Street address is required'),

                body('city').trim().notEmpty().withMessage('City is required'),

                body('state').optional().trim(),

                body('zip_code').trim().notEmpty().withMessage('ZIP code is required'),

                body('country').optional().trim().default('Pakistan'),

                body('is_default')
                    .optional()
                    .isBoolean()
                    .withMessage('is_default must be a boolean')
            ];
        }

        case 'update': {
            return [
                body('address_id')
                    .notEmpty()
                    .withMessage('Address ID is required')
                    .isInt({ min: 1 })
                    .withMessage('Invalid address ID'),

                body('street').optional().trim(),

                body('city').optional().trim(),

                body('state').optional().trim(),

                body('zip_code').optional().trim(),

                body('country').optional().trim()
            ];
        }

        case 'delete': {
            return [
                body('address_id')
                    .notEmpty()
                    .withMessage('Address ID is required')
                    .isInt({ min: 1 })
                    .withMessage('Invalid address ID')
            ];
        }

        case 'list': {
            return [];
        }

        default:
            return [];
    }
};

module.exports = ValidationRules;
