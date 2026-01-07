/**
 * Auth Validation Rules
 * Per QAutos pattern: Export rules via rule() method
 */
const { body } = require('express-validator');

const ValidationRules = {};

// Custom validators
const validatePassword = password => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const isValidLength = password.length >= 8;
    return isValidLength && hasUpperCase && hasLowerCase && hasNumber;
};

const validatePhone = phone => /^\+?\d{10,15}$/.test(phone);

ValidationRules.rule = method => {
    switch (method) {
        case 'register':
        case 'signup': {
            return [
                body('fullName')
                    .trim()
                    .notEmpty()
                    .withMessage('Full Name is required')
                    .isLength({ min: 2, max: 100 })
                    .withMessage('Name must be between 2 and 100 characters'),

                body('email')
                    .trim()
                    .notEmpty()
                    .withMessage('Email is required')
                    .isEmail()
                    .withMessage('Please provide a valid email address'),

                body('password')
                    .notEmpty()
                    .withMessage('Password is required')
                    .custom(validatePassword)
                    .withMessage(
                        'Password must be at least 8 characters long, contain one uppercase letter, one lowercase letter, and one number'
                    ),

                body('phone')
                    .optional()
                    .custom(validatePhone)
                    .withMessage('Please provide a valid phone number')
            ];
        }

        case 'login': {
            return [
                body('email')
                    .trim()
                    .notEmpty()
                    .withMessage('Email is required')
                    .isEmail()
                    .withMessage('Please provide a valid email address'),

                body('password').notEmpty().withMessage('Password is required')
            ];
        }

        case 'verifyOtp': {
            return [
                body('email').trim().isEmail().withMessage('Invalid email format'),

                body('otp')
                    .notEmpty()
                    .withMessage('OTP is required')
                    .isLength({ min: 4, max: 6 })
                    .withMessage('OTP must be 4-6 characters')
            ];
        }

        case 'resendOtp': {
            return [body('email').trim().isEmail().withMessage('Invalid email format')];
        }

        case 'forgotPassword': {
            return [
                body('email')
                    .trim()
                    .notEmpty()
                    .withMessage('Email is required')
                    .isEmail()
                    .withMessage('Please provide a valid email address')
            ];
        }

        case 'resetPassword': {
            return [
                body('email').trim().isEmail().withMessage('Invalid email format'),

                body('token').notEmpty().withMessage('Reset token is required'),

                body('password')
                    .notEmpty()
                    .withMessage('Password is required')
                    .custom(validatePassword)
                    .withMessage(
                        'Password must be at least 8 characters long, contain one uppercase letter, one lowercase letter, and one number'
                    ),

                body('confirmPassword')
                    .notEmpty()
                    .withMessage('Confirm password is required')
                    .custom((value, { req }) => {
                        if (value !== req.body.password) {
                            throw new Error('Passwords do not match');
                        }
                        return true;
                    })
            ];
        }

        case 'changePassword': {
            return [
                body('currentPassword').notEmpty().withMessage('Current password is required'),

                body('newPassword')
                    .notEmpty()
                    .withMessage('New password is required')
                    .custom(validatePassword)
                    .withMessage(
                        'Password must be at least 8 characters long, contain one uppercase letter, one lowercase letter, and one number'
                    ),

                body('confirmPassword')
                    .notEmpty()
                    .withMessage('Confirm password is required')
                    .custom((value, { req }) => {
                        if (value !== req.body.newPassword) {
                            throw new Error('Passwords do not match');
                        }
                        return true;
                    })
            ];
        }

        case 'googleLogin': {
            return [
                body().custom((value, { req }) => {
                    if (!req.body.id_token && !req.body.access_token) {
                        throw new Error('Either id_token or access_token is required');
                    }
                    return true;
                })
            ];
        }

        default:
            return [];
    }
};

module.exports = ValidationRules;
