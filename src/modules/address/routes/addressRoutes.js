/**
 * Address Routes
 * Per QAutos pattern:
 * - No route-level authentication (handled centrally in app.js)
 * - Validation rules via ValidationRules.rule('methodName')
 * - Centralized Validation.validate middleware
 * - Clean routes: Only reference controllers, no inline logic
 */
const express = require('express');
const addressRules = require('../validations/addressValidation');
const Validation = require('../../../../utils/validation');

// Controllers
const {
    addAddress,
    updateAddress,
    deleteAddress,
    viewAddresses
} = require('../controllers/addressController');

const routes = function () {
    const router = express.Router({ mergeParams: true });

    //------------------------------------//
    // ALL ADDRESS ROUTES ARE PROTECTED (auth handled centrally)
    //------------------------------------//

    // Add a new address
    router.route('/add').post(addressRules.rule('add'), Validation.validate, addAddress);

    // Update an existing address
    router.route('/update').put(addressRules.rule('update'), Validation.validate, updateAddress);

    // Delete an address
    router.route('/delete').delete(addressRules.rule('delete'), Validation.validate, deleteAddress);

    // View all addresses
    router.route('/list').get(addressRules.rule('list'), Validation.validate, viewAddresses);

    // Alias for backward compatibility
    router.route('/view').get(addressRules.rule('list'), Validation.validate, viewAddresses);

    return router;
};

module.exports = routes;
