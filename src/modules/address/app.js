const express = require("express");

let routes = function () {
  const router = express.Router();
  router.use("/", require("./routes/addressRoutes")());
  return router;
};

module.exports = routes;
