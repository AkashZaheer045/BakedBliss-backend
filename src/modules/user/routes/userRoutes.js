const express = require('express');
const authenticateToken = require('../../../../middleware/authMiddleware');
const { addFavorite, removeFavorite, listFavorites } = require('../controllers/favoritesController');

let routes = function () {
    const router = express.Router({ mergeParams: true });

    // Favorites
    router.post('/:user_id/favorites', authenticateToken, addFavorite);
    router.delete('/:user_id/favorites/:product_id', authenticateToken, removeFavorite);
    router.get('/:user_id/favorites', authenticateToken, listFavorites);

    return router;
};

module.exports = routes;
