/**
 * User Routes
 * Per QAutos pattern:
 * - No route-level authentication (handled centrally in app.js)
 * - Validation rules via ValidationRules.rule('methodName')
 * - Centralized Validation.validate middleware
 * - Clean routes: Only reference controllers, no inline logic
 */
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
        .route('/profile/:user_id')
        .get(getUserProfile)
        .put(userRules.rule('updateProfile'), Validation.validate, updateUserProfile);

    //------------------------------------//
    // FAVORITES ROUTES (auth handled centrally)
    //------------------------------------//

    // Add to favorites
    router
        .route('/:user_id/favorites')
        .post(userRules.rule('addFavorite'), Validation.validate, addFavorite)
        .get(userRules.rule('listFavorites'), Validation.validate, listFavorites);

    // Remove from favorites
    router
        .route('/:user_id/favorites/:product_id')
        .delete(userRules.rule('removeFavorite'), Validation.validate, removeFavorite);

    return router;
};

module.exports = routes;
