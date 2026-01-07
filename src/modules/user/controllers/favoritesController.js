/**
 * Favorites Controller
 * Handles HTTP requests/responses, delegates business logic to UserService
 */
const UserService = require('../services/userService');

// Add product to user's favorites
const addFavorite = async (req, res) => {
    try {
        const { user_id } = req.params;
        const { productId } = req.body;

        if (!req.user || req.user.user_id !== user_id) {
            return res.status(403).json({ status: 'error', message: 'Forbidden' });
        }

        if (!productId) {
            return res.status(400).json({ status: 'error', message: 'productId is required' });
        }

        const [result, error] = await UserService.addFavorite(user_id, productId);

        if (error) {
            console.error('addFavorite error:', error);
            return res
                .status(error.status || 500)
                .json({ status: 'error', message: error.message || 'Server error' });
        }

        if (result.alreadyExists) {
            return res.status(200).json({
                status: 'success',
                message: 'Already in favorites',
                data: { productId }
            });
        }

        res.status(201).json({
            status: 'success',
            message: 'Added to favorites',
            data: { productId }
        });
    } catch (error) {
        console.error('addFavorite error:', error);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};

// Remove product from favorites
const removeFavorite = async (req, res) => {
    try {
        const { user_id, product_id } = req.params;

        if (!req.user || req.user.user_id !== user_id) {
            return res.status(403).json({ status: 'error', message: 'Forbidden' });
        }

        const [_success, error] = await UserService.removeFavorite(user_id, product_id);

        if (error) {
            console.error('removeFavorite error:', error);
            return res
                .status(error.status || 500)
                .json({ status: 'error', message: error.message || 'Server error' });
        }

        res.status(200).json({ status: 'success', message: 'Removed from favorites' });
    } catch (error) {
        console.error('removeFavorite error:', error);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};

// List user's favorites
const listFavorites = async (req, res) => {
    try {
        const { user_id } = req.params;

        if (!req.user || req.user.user_id !== user_id) {
            return res.status(403).json({ status: 'error', message: 'Forbidden' });
        }

        const [favorites, error] = await UserService.listFavorites(user_id);

        if (error) {
            console.error('listFavorites error:', error);
            return res
                .status(error.status || 500)
                .json({ status: 'error', message: error.message || 'Server error' });
        }

        res.status(200).json({ status: 'success', data: favorites });
    } catch (error) {
        console.error('listFavorites error:', error);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};

module.exports = { addFavorite, removeFavorite, listFavorites };
