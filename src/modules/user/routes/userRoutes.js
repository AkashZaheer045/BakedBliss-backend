const express = require('express');
const router = express.Router();
const authenticateToken = require('../../../../middleware/authMiddleware');
const { addFavorite, removeFavorite, listFavorites } = require('../controllers/favoritesController');

// Favorites
router.post('/:user_id/favorites', authenticateToken, addFavorite);
router.delete('/:user_id/favorites/:product_id', authenticateToken, removeFavorite);
router.get('/:user_id/favorites', authenticateToken, listFavorites);

module.exports = router;
