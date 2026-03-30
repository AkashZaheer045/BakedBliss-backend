/**
 * User Profile Controller
 * Handles HTTP requests/responses, delegates business logic to UserService
 */
const UserService = require('../services/userService');

// Get user profile
const getUserProfile = async (req, res) => {
    try {
        const authenticatedUserId = req.user?.id;
        const requestedIdRaw = req.params.id || req.params.user_id;

        if (!authenticatedUserId) {
            return res.status(401).json({ status: 'error', message: 'Authentication required' });
        }

        if (requestedIdRaw && parseInt(requestedIdRaw, 10) !== authenticatedUserId) {
            return res.status(403).json({ status: 'error', message: 'Forbidden' });
        }

        const userId = authenticatedUserId;

        const [profile, error] = await UserService.getUserProfile(userId);

        if (error) {
            console.error('Error retrieving user profile:', error);
            return res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'An error occurred while retrieving the user profile.'
            });
        }

        res.status(200).json({ status: 'success', data: profile });
    } catch (error) {
        console.error('Error retrieving user profile:', error);
        res.status(500).json({
            status: 'error',
            message: 'An error occurred while retrieving the user profile.'
        });
    }
};

// Update user profile
const updateUserProfile = async (req, res) => {
    try {
        const authenticatedUserId = req.user?.id;
        const requestedIdRaw = req.params.id || req.params.user_id;

        if (!authenticatedUserId) {
            return res.status(401).json({ status: 'error', message: 'Authentication required' });
        }

        if (requestedIdRaw && parseInt(requestedIdRaw, 10) !== authenticatedUserId) {
            return res.status(403).json({ status: 'error', message: 'Forbidden' });
        }

        const userId = authenticatedUserId;
        const { fullName, phoneNumber, profilePicture } = req.body;

        const [profile, error] = await UserService.updateUserProfile(userId, {
            fullName,
            phoneNumber,
            profilePicture
        });

        if (error) {
            console.error('Error updating user profile:', error);
            return res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'An error occurred while updating the user profile.'
            });
        }

        res.status(200).json({ status: 'success', message: 'Profile updated', data: profile });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({
            status: 'error',
            message: 'An error occurred while updating the user profile.'
        });
    }
};

module.exports = { getUserProfile, updateUserProfile };
