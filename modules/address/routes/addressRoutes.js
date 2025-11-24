// addressRoutes.js
const express = require('express');
const router = express.Router();
const authenticateToken= require('../../../middleware/authMiddleware'); // Assuming the middleware is already implemented

const {
  addAddress,
  updateAddress,
  deleteAddress,
  viewAddresses
} = require('../controllers/addressController');

// Add a new address
router.post('/add', authenticateToken, addAddress);

// Update an existing address
router.put('/update', authenticateToken, updateAddress);

// Delete an address
router.delete('/delete', authenticateToken, deleteAddress);

// View all addresses
router.get('/view', authenticateToken, viewAddresses);

module.exports = router;