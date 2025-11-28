const express = require("express");

let routes = function () {
    const router = express.Router();
    router.use("/", require("./routes/authRoutes")());
    return router;
};

module.exports = routes;