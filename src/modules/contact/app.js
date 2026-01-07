const express = require('express');

const routes = function () {
    const router = express.Router();
    router.use('/', require('./routes/contactRoutes')());
    return router;
};

module.exports = routes;
