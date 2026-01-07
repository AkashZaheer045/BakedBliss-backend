/**
 * Contact Routes
 * Per QAutos pattern:
 * - No route-level authentication (handled centrally in app.js)
 * - Validation rules via ValidationRules.rule('methodName')
 * - Centralized Validation.validate middleware
 * - Clean routes: Only reference controllers, no inline logic
 */
const express = require('express');
const contactRules = require('../validations/contactValidation');
const Validation = require('../../../../utils/validation');

// Controllers
const { submitContactForm, getAllMessages } = require('../controllers/contactController');

const routes = function () {
    const router = express.Router({ mergeParams: true });

    //------------------------------------//
    // PUBLIC ROUTES (defined in auth.js allowedPaths)
    //------------------------------------//

    // Contact Us form submission
    router
        .route('/contact-us')
        .post(contactRules.rule('submit'), Validation.validate, submitContactForm);

    // Alias for frontend compatibility
    router.route('/send').post(contactRules.rule('submit'), Validation.validate, submitContactForm);

    // Alias for submit
    router
        .route('/submit')
        .post(contactRules.rule('submit'), Validation.validate, submitContactForm);

    //------------------------------------//
    // ADMIN ROUTES (auth handled centrally)
    //------------------------------------//

    // Get all messages
    router.route('/messages').get(contactRules.rule('list'), Validation.validate, getAllMessages);

    router.route('/list').get(contactRules.rule('list'), Validation.validate, getAllMessages);

    return router;
};

module.exports = routes;
