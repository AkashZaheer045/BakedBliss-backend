/**
 * Favorites Controller
 * Handles HTTP requests/responses, delegates business logic to UserService
 */
const UserService = require('../services/userService');

// Add product to user's favorites
const addFavorite = async (req, res) => {
    try {
        const authenticatedUserId = req.user?.id;
        const requestedId = req.params.id ? parseInt(req.params.id, 10) : null;
        const { productId } = req.body;

        if (!authenticatedUserId) {
            return res.status(401).json({ status: 'error', message: 'Authentication required' });
        }

        if (requestedId && requestedId !== authenticatedUserId) {
            return res.status(403).json({ status: 'error', message: 'Forbidden' });
        }

        const userId = authenticatedUserId;

        if (!productId) {
            return res.status(400).json({ status: 'error', message: 'productId is required' });
        }

        const [result, error] = await UserService.addFavorite(userId, productId);

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
        const authenticatedUserId = req.user?.id;
        const requestedId = req.params.id ? parseInt(req.params.id, 10) : null;
        const productId = parseInt(req.params.product_id, 10);

        if (!authenticatedUserId) {
            return res.status(401).json({ status: 'error', message: 'Authentication required' });
        }

        if (requestedId && requestedId !== authenticatedUserId) {
            return res.status(403).json({ status: 'error', message: 'Forbidden' });
        }

        const userId = authenticatedUserId;

        const [_success, error] = await UserService.removeFavorite(userId, productId);

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
        const authenticatedUserId = req.user?.id;
        const requestedId = req.params.id ? parseInt(req.params.id, 10) : null;

        if (!authenticatedUserId) {
            return res.status(401).json({ status: 'error', message: 'Authentication required' });
        }

        if (requestedId && requestedId !== authenticatedUserId) {
            return res.status(403).json({ status: 'error', message: 'Forbidden' });
        }

        const userId = authenticatedUserId;

        const [favorites, error] = await UserService.listFavorites(userId);

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
