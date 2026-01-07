const express = require('express');

const routes = function () {
    const router = express.Router();
    router.use('/', require('./routes/adminRoutes')());
    return router;
};

module.exports = routes;
