const express = require('express');
const { confirmOrder, viewOrderHistory, getOrderStatus } = require('../controllers/orderController');
const authenticateToken = require('../../../../middleware/authMiddleware');

let routes = function () {
    const router = express.Router({ mergeParams: true });

    router.post('/confirm', authenticateToken, confirmOrder);
    router.get('/history', authenticateToken, viewOrderHistory);
    router.get('/status/:orderId', authenticateToken, getOrderStatus);

    return router;
};

module.exports = routes;