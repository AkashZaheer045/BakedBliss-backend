const express = require('express');
const { addItemToCart, viewCart, updateCartItem, removeItemFromCart } = require('../controllers/cartController'); // Make sure this path is correct

const authenticateToken = require('../../../middleware/authMiddleware'); // Make sure middleware is properly imported

const router = express.Router();

// Ensure all routes are defined properly
router.post('/add', authenticateToken, addItemToCart);
router.get('/view', authenticateToken, viewCart);
router.put('/update', authenticateToken, updateCartItem);
router.delete('/remove', authenticateToken, removeItemFromCart);

module.exports = router;
