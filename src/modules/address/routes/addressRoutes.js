const express = require('express');
const authenticateToken = require('../../../../middleware/authMiddleware');
const {
  addAddress,
  updateAddress,
  deleteAddress,
  viewAddresses
} = require('../controllers/addressController');

let routes = function () {
  const router = express.Router({ mergeParams: true });

  // Add a new address
  router.post('/add', authenticateToken, addAddress);

  // Update an existing address
  router.put('/update', authenticateToken, updateAddress);

  // Delete an address
  router.delete('/delete', authenticateToken, deleteAddress);

  // View all addresses
  router.get('/view', authenticateToken, viewAddresses);

  return router;
};

module.exports = routes;