const express = require("express");

let routes = function () {
    const router = express.Router();
    router.use("/", require("./routes/adminRoutes")());
    return router;
};

module.exports = routes;
