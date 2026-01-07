const express = require('express');

const routes = function () {
    const router = express.Router();
    router.use('/', require('./routes/cartRoutes')());
    return router;
};

module.exports = routes;
