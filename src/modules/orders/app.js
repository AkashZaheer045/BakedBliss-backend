const express = require("express");

let routes = function () {
  const router = express.Router();
  router.use("/", require("./routes/orderRoutes")());
  return router;
};

module.exports = routes;
