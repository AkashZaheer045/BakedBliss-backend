const express = require('express');
const userRules = require('../validations/userValidation');
const Validation = require('../../../../utils/validation');

// Controllers
const {
    addFavorite,
    removeFavorite,
    listFavorites
} = require('../controllers/favoritesController');

const { getUserProfile, updateUserProfile } = require('../controllers/userProfileController');

const routes = function () {
    const router = express.Router({ mergeParams: true });

    //------------------------------------//
    // PROFILE ROUTES (auth handled centrally)
    //------------------------------------//

    router
        .route('/profile')
        .get(getUserProfile)
        .put(userRules.rule('updateProfileSelf'), Validation.validate, updateUserProfile);

    router
        .route('/profile/:id')
        .get(getUserProfile)
        .put(userRules.rule('updateProfile'), Validation.validate, updateUserProfile);

    //------------------------------------//
    // FAVORITES ROUTES (auth handled centrally)
    //------------------------------------//

    // Self-scoped favorites routes (no user id in path)
    router
        .route('/favorites')
        .post(userRules.rule('addFavoriteSelf'), Validation.validate, addFavorite)
        .get(userRules.rule('listFavoritesSelf'), Validation.validate, listFavorites);

    router
        .route('/favorites/:product_id')
        .delete(userRules.rule('removeFavoriteSelf'), Validation.validate, removeFavorite);

    // Add to favorites
    router
        .route('/:id/favorites')
        .post(userRules.rule('addFavorite'), Validation.validate, addFavorite)
        .get(userRules.rule('listFavorites'), Validation.validate, listFavorites);

    // Remove from favorites
    router
        .route('/:id/favorites/:product_id')
        .delete(userRules.rule('removeFavorite'), Validation.validate, removeFavorite);

    return router;
};

module.exports = routes;
