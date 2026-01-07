/**
 * Address Service
 * Handles all address-related database operations
 */
const { models, db } = require('../../../../db/sequelize/sequelize');

/**
 * Get user's addresses
 */
const getAddresses = async userId => {
    try {
        const userInstance = new db(models.users);
        const [user, err] = await userInstance.fetchOne({ user_id: userId });
        if (err) {
            return [null, err];
        }
        if (!user) {
            return [null, { message: 'User not found', status: 404 }];
        }

        return [user.addresses || [], null];
    } catch (error) {
        return [null, error];
    }
};

/**
 * Add address
 */
const addAddress = async (userId, address) => {
    try {
        const userInstance = new db(models.users);
        const [user, findErr] = await userInstance.fetchOne({ user_id: userId });
        if (findErr) {
            return [null, findErr];
        }
        if (!user) {
            return [null, { message: 'User not found', status: 404 }];
        }

        const currentAddresses = JSON.parse(JSON.stringify(user.addresses || []));
        currentAddresses.push(address);

        user.addresses = currentAddresses;
        user.changed('addresses', true);
        await user.save();

        return [currentAddresses, null];
    } catch (error) {
        return [null, error];
    }
};

/**
 * Update address
 */
const updateAddress = async (userId, addressId, updatedAddress) => {
    try {
        const userInstance = new db(models.users);
        const [user, findErr] = await userInstance.fetchOne({ user_id: userId });
        if (findErr) {
            return [null, findErr];
        }
        if (!user) {
            return [null, { message: 'User not found', status: 404 }];
        }

        const currentAddresses = JSON.parse(JSON.stringify(user.addresses || []));
        const updatedAddresses = currentAddresses.map((addr, idx) =>
            idx === addressId ? updatedAddress : addr
        );

        user.addresses = updatedAddresses;
        user.changed('addresses', true);
        await user.save();

        return [updatedAddresses, null];
    } catch (error) {
        return [null, error];
    }
};

/**
 * Delete address
 */
const deleteAddress = async (userId, addressId) => {
    try {
        const userInstance = new db(models.users);
        const [user, findErr] = await userInstance.fetchOne({ user_id: userId });
        if (findErr) {
            return [null, findErr];
        }
        if (!user) {
            return [null, { message: 'User not found', status: 404 }];
        }

        const currentAddresses = JSON.parse(JSON.stringify(user.addresses || []));
        const updatedAddresses = currentAddresses.filter((_, idx) => idx !== addressId);

        user.addresses = updatedAddresses;
        user.changed('addresses', true);
        await user.save();

        return [updatedAddresses, null];
    } catch (error) {
        return [null, error];
    }
};

module.exports = {
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress
};
