const express = require('express');
const { submitContactForm } = require('../controllers/contactController');

let routes = function () {
    const router = express.Router({ mergeParams: true });

    // Define the route for Contact Us form submission
    router.post('/contact-us', submitContactForm);

    return router;
};

module.exports = routes;
