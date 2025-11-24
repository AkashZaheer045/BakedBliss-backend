const express = require('express');
const { confirmOrder, viewOrderHistory, getOrderStatus } = require('../controllers/orderController');
const authenticateToken = require('../../../middleware/authMiddleware'); // Firebase token verification

const router = express.Router();

router.post('/confirm', authenticateToken, confirmOrder);
router.get('/history', authenticateToken, viewOrderHistory);
router.get('/status/:orderId', authenticateToken, getOrderStatus);

module.exports = router;