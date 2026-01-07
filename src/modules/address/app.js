const express = require('express');

const routes = function () {
    const router = express.Router();
    router.use('/', require('./routes/addressRoutes')());
    return router;
};

module.exports = routes;
