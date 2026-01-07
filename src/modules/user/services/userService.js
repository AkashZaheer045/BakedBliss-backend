/**
 * User Service
 * Handles all user-related database operations (profile, favorites)
 */
const { models, db } = require('../../../../db/sequelize/sequelize');

/**
 * Get user profile
 */
const getUserProfile = async userId => {
    try {
        const userInstance = new db(models.users);
        const [user, err] = await userInstance.fetchOne({ user_id: userId });
        if (err) {
            return [null, err];
        }
        if (!user) {
            return [null, { message: 'User not found', status: 404 }];
        }

        return [
            {
                userId: user.user_id,
                fullName: user.full_name,
                email: user.email,
                phoneNo: user.phone_number,
                imageUrl: user.profile_picture,
                role: user.role,
                dateJoined: user.date_joined
            },
            null
        ];
    } catch (error) {
        return [null, error];
    }
};

/**
 * Update user profile
 */
const updateUserProfile = async (userId, updateData) => {
    try {
        const userInstance = new db(models.users);
        const [user, findErr] = await userInstance.fetchOne({ user_id: userId });
        if (findErr) {
            return [null, findErr];
        }
        if (!user) {
            return [null, { message: 'User not found', status: 404 }];
        }

        if (updateData.fullName) {
            user.full_name = updateData.fullName;
        }
        if (updateData.phoneNumber) {
            user.phone_number = updateData.phoneNumber;
        }
        if (updateData.profilePicture) {
            user.profile_picture = updateData.profilePicture;
        }
        user.updated_at = new Date();

        await user.save();

        return [
            {
                userId: user.user_id,
                fullName: user.full_name,
                email: user.email,
                phoneNo: user.phone_number,
                imageUrl: user.profile_picture
            },
            null
        ];
    } catch (error) {
        return [null, error];
    }
};

/**
 * Add product to favorites
 */
const addFavorite = async (userId, productId) => {
    console.log(`[UserService] Adding favorite: User ${userId}, Product ${productId}`);
    try {
        const productInstance = new db(models.products);
        const favoriteInstance = new db(models.favorites);

        // Check if product exists
        const [product, productErr] = await productInstance.findByPk(productId);
        if (productErr) {
            return [null, productErr];
        }
        if (!product) {
            return [null, { message: 'Product not found', status: 404 }];
        }

        // Check if already in favorites
        const [existingFavorite, findErr] = await favoriteInstance.fetchOne({
            user_id: userId,
            product_id: productId
        });
        if (findErr) {
            return [null, findErr];
        }

        if (existingFavorite) {
            return [{ productId, alreadyExists: true }, null];
        }

        // Add to favorites
        const [_newFavorite, createErr] = await favoriteInstance.create({
            user_id: userId,
            product_id: productId
        });
        if (createErr) {
            return [null, createErr];
        }

        return [{ productId, alreadyExists: false }, null];
    } catch (error) {
        return [null, error];
    }
};

/**
 * Remove from favorites
 */
const removeFavorite = async (userId, productId) => {
    try {
        const favoriteInstance = new db(models.favorites);

        const [favorite, findErr] = await favoriteInstance.fetchOne({
            user_id: userId,
            product_id: productId
        });
        if (findErr) {
            return [null, findErr];
        }
        if (!favorite) {
            return [null, { message: 'Favorite not found', status: 404 }];
        }

        await favorite.destroy();
        return [true, null];
    } catch (error) {
        return [null, error];
    }
};

/**
 * List user's favorites
 */
const listFavorites = async userId => {
    try {
        const favoriteInstance = new db(models.favorites);
        const productInstance = new db(models.products);

        const [favorites, findErr] = await favoriteInstance.findAll({
            where: { user_id: userId },
            order: [['created_at', 'DESC']]
        });
        if (findErr) {
            return [null, findErr];
        }

        const favoritesData = await Promise.all(
            (favorites || []).map(async fav => {
                const [product] = await productInstance.findByPk(fav.product_id);
                return {
                    productId: fav.product_id,
                    createdAt: fav.created_at,
                    product: product ? product.toJSON() : null
                };
            })
        );

        return [favoritesData, null];
    } catch (error) {
        return [null, error];
    }
};

module.exports = {
    getUserProfile,
    updateUserProfile,
    addFavorite,
    removeFavorite,
    listFavorites
};
