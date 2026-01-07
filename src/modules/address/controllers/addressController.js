/**
 * Address Controller
 * Handles HTTP requests/responses, delegates business logic to AddressService
 */
const AddressService = require('../services/addressService');

// Add a new address
const addAddress = async (req, res) => {
    try {
        const userId = req.user && (req.user.uid || req.user.userId);
        const address = req.body; // Use flattened body

        // Validation already checked required fields

        const [addresses, error] = await AddressService.addAddress(userId, address);

        if (error) {
            console.error('Error adding address:', error);
            return res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Failed to add address.'
            });
        }

        res.status(201).json({
            status: 'success',
            message: 'Address added successfully.',
            data: addresses
        });
    } catch (error) {
        console.error('Error adding address:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to add address.',
            error: error.message
        });
    }
};

// Update an address
const updateAddress = async (req, res) => {
    try {
        const userId = req.user && (req.user.uid || req.user.userId);
        const { address_id, ...updatedAddress } = req.body; // Extract address_id (snake_case from validator)

        if (!address_id) {
            return res
                .status(400)
                .json({ status: 'error', message: 'Address ID is required.' });
        }

        const [addresses, error] = await AddressService.updateAddress(
            userId,
            address_id,
            updatedAddress
        );

        if (error) {
            console.error('Error updating address:', error);
            return res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Failed to update address.'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Address updated successfully.',
            data: addresses
        });
    } catch (error) {
        console.error('Error updating address:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update address.',
            error: error.message
        });
    }
};

// Delete an address
const deleteAddress = async (req, res) => {
    try {
        const userId = req.user && (req.user.uid || req.user.userId);
        const { address_id } = req.body;

        if (!address_id) {
            return res.status(400).json({ status: 'error', message: 'Address ID is required.' });
        }

        const [addresses, error] = await AddressService.deleteAddress(userId, address_id);

        if (error) {
            console.error('Error deleting address:', error);
            return res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Failed to delete address.'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Address deleted successfully.',
            data: addresses
        });
    } catch (error) {
        console.error('Error deleting address:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete address.',
            error: error.message
        });
    }
};

// View all addresses
const viewAddresses = async (req, res) => {
    try {
        const userId = req.user && (req.user.uid || req.user.userId);

        const [addresses, error] = await AddressService.getAddresses(userId);

        if (error) {
            console.error('Error viewing addresses:', error);
            return res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Failed to retrieve addresses.'
            });
        }

        res.status(200).json({ status: 'success', message: 'success', data: addresses });
    } catch (error) {
        console.error('Error viewing addresses:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve addresses.',
            error: error.message
        });
    }
};

module.exports = { addAddress, updateAddress, deleteAddress, viewAddresses };
