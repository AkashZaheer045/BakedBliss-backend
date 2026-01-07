/**
 * Order Routes
 * Per QAutos pattern:
 * - No route-level authentication (handled centrally in app.js)
 * - Validation rules via ValidationRules.rule('methodName')
 * - Centralized Validation.validate middleware
 * - Clean routes: Only reference controllers, no inline logic
 */
const express = require('express');
const orderRules = require('../validations/orderValidation');
const Validation = require('../../../../utils/validation');

// Controllers
const {
    confirmOrder,
    viewOrderHistory,
    getOrderStatus,
    getAllOrders,
    updateOrderStatus,
    cancelOrder,
    getOrderStats
} = require('../controllers/orderController');

const routes = function () {
    const router = express.Router({ mergeParams: true });

    //------------------------------------//
    // CUSTOMER ROUTES (auth handled centrally)
    //------------------------------------//

    // Create order
    router.route('/create').post(orderRules.rule('create'), Validation.validate, confirmOrder);

    // Alias for backward compatibility
    router.route('/confirm').post(orderRules.rule('create'), Validation.validate, confirmOrder);

    // View order history
    router.route('/history').get(orderRules.rule('list'), Validation.validate, viewOrderHistory);

    // Get orders for user
    router.route('/user/:userId').get(orderRules.rule('list'), Validation.validate, viewOrderHistory);

    // Get order status
    router.route('/status/:orderId').get(getOrderStatus);

    // Get order details
    router.route('/details/:orderId').get(getOrderStatus);

    // Cancel order
    router.route('/cancel/:orderId').put(orderRules.rule('cancel'), Validation.validate, cancelOrder);

    //------------------------------------//
    // ADMIN ROUTES
    //------------------------------------//

    // Get all orders (admin)
    router.route('/all').get(orderRules.rule('list'), Validation.validate, getAllOrders);

    // Update order status (admin)
    router.route('/status').put(orderRules.rule('updateStatus'), Validation.validate, updateOrderStatus);

    // Order stats (admin)
    router.route('/stats').get(getOrderStats);

    // Get single order by ID (keep at bottom for catch-all)
    router.route('/:orderId').get(getOrderStatus);

    return router;
};

module.exports = routes;
