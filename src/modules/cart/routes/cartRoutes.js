/**
 * Cart Routes
 * Per QAutos pattern:
 * - No route-level authentication (handled centrally in app.js)
 * - Validation rules via ValidationRules.rule('methodName')
 * - Centralized Validation.validate middleware
 */
const express = require('express');
const cartRules = require('../validations/cartValidation');
const Validation = require('../../../../utils/validation');

// Controllers
const {
    addItemToCart,
    viewCart,
    updateCartItem,
    removeItemFromCart,
    clearCart
} = require('../controllers/cartController');

const routes = function () {
    const router = express.Router({ mergeParams: true });

    //------------------------------------//
    // ALL CART ROUTES ARE PROTECTED (auth handled centrally)
    //------------------------------------//

    // Add item to cart
    router.route('/add').post(cartRules.rule('addItem'), Validation.validate, addItemToCart);

    // View cart
    router.route('/view').get(cartRules.rule('getCart'), Validation.validate, viewCart);

    // Also support /items endpoint
    router.route('/items').get(cartRules.rule('getCart'), Validation.validate, viewCart);

    // Update cart item
    router.route('/update').put(cartRules.rule('updateItem'), Validation.validate, updateCartItem);

    // Remove item from cart
    router
        .route('/remove')
        .delete(cartRules.rule('removeItem'), Validation.validate, removeItemFromCart);

    // Clear cart
    router.route('/clear').delete(cartRules.rule('clearCart'), Validation.validate, clearCart);

    return router;
};

module.exports = routes;
