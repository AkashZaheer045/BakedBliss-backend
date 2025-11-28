const express = require('express');
const { addItemToCart, viewCart, updateCartItem, removeItemFromCart } = require('../controllers/cartController');
const authenticateToken = require('../../../../middleware/authMiddleware');

let routes = function () {
    const router = express.Router({ mergeParams: true });

    // Ensure all routes are defined properly
    router.post('/add', authenticateToken, addItemToCart);
    router.get('/view', authenticateToken, viewCart);
    router.put('/update', authenticateToken, updateCartItem);
    router.delete('/remove', authenticateToken, removeItemFromCart);

    return router;
};

module.exports = routes;
