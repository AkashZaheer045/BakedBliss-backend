const express = require('express');

const routes = function () {
    const router = express.Router();
    router.use('/', require('./routes/orderRoutes')());
    return router;
};

module.exports = routes;
