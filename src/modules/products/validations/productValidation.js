/**
 * Product Validation Rules
 * Per QAutos pattern: Export rules via rule() method
 * Usage: routes.route("/create").post(rules.rule('create'), Validation.validate, controller.action)
 */
const { body, param, query } = require('express-validator');

const ValidationRules = {};

ValidationRules.rule = method => {
    switch (method) {
        case 'create': {
            return [
                body('title')
                    .trim()
                    .notEmpty()
                    .withMessage('Product title is required')
                    .isLength({ min: 3, max: 512 })
                    .withMessage('Title must be between 3 and 512 characters'),

                body('price')
                    .notEmpty()
                    .withMessage('Price is required')
                    .isFloat({ min: 0.01 })
                    .withMessage('Price must be a positive number'),

                body('sale_price')
                    .optional()
                    .isFloat({ min: 0 })
                    .withMessage('Sale price must be a positive number')
                    .custom((value, { req }) => {
                        if (value && parseFloat(value) >= parseFloat(req.body.price)) {
                            throw new Error('Sale price must be less than regular price');
                        }
                        return true;
                    }),

                body('category')
                    .trim()
                    .notEmpty()
                    .withMessage('Category is required')
                    .isLength({ max: 255 })
                    .withMessage('Category must be less than 255 characters'),

                body('description')
                    .optional()
                    .trim()
                    .isLength({ max: 5000 })
                    .withMessage('Description must be less than 5000 characters'),

                body('stock')
                    .optional()
                    .isInt({ min: 0 })
                    .withMessage('Stock must be a non-negative integer'),

                body('ingredients')
                    .optional()
                    .isArray()
                    .withMessage('Ingredients must be an array'),

                body('images').optional().isArray().withMessage('Images must be an array')
            ];
        }

        case 'update': {
            return [
                param('product_id').isInt({ min: 1 }).withMessage('Invalid product ID'),

                body('title')
                    .optional()
                    .trim()
                    .isLength({ min: 3, max: 512 })
                    .withMessage('Title must be between 3 and 512 characters'),

                body('price')
                    .optional()
                    .isFloat({ min: 0.01 })
                    .withMessage('Price must be a positive number'),

                body('sale_price')
                    .optional()
                    .isFloat({ min: 0 })
                    .withMessage('Sale price must be a positive number'),

                body('category')
                    .optional()
                    .trim()
                    .isLength({ max: 255 })
                    .withMessage('Category must be less than 255 characters'),

                body('stock')
                    .optional()
                    .isInt({ min: 0 })
                    .withMessage('Stock must be a non-negative integer')
            ];
        }

        case 'search': {
            return [
                query('query')
                    .trim()
                    .notEmpty()
                    .withMessage('Search query is required')
                    .isLength({ min: 1, max: 100 })
                    .withMessage('Search query must be between 1 and 100 characters')
            ];
        }

        case 'getById': {
            return [param('product_id').isInt({ min: 1 }).withMessage('Invalid product ID')];
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
                    .withMessage('Limit must be between 1 and 100'),

                query('category')
                    .optional()
                    .trim()
                    .isLength({ max: 255 })
                    .withMessage('Category must be less than 255 characters'),

                query('sort')
                    .optional()
                    .isIn(['price_asc', 'price_desc', 'rating', 'newest'])
                    .withMessage('Invalid sort option')
            ];
        }

        case 'getByCategory': {
            return [
                param('category_name').trim().notEmpty().withMessage('Category name is required')
            ];
        }

        case 'delete': {
            return [param('product_id').isInt({ min: 1 }).withMessage('Invalid product ID')];
        }

        default:
            return [];
    }
};

module.exports = ValidationRules;
