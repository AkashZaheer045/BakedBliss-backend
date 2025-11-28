const cors = require("cors");
const morgan = require("morgan");
const moment = require("moment");
const express = require("express");
const bodyParser = require("body-parser");
require('dotenv').config()
const { request_getters, request_parser, not_found, allowed_methods } = require('eb-butler-utils')
// const common = require('./helpers/common') // Assuming this helper exists or will be created
// const constants = require('./config/constants.json') // Assuming this config exists
//--//


//------------------------------------//
const app = express();
app.use(cors({ optionsSuccessStatus: 200 }));
// app.options("(.*)", cors({ optionsSuccessStatus: 200 }));
//------------------------------------//
app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
//------------------------------------//
app.use("/uploads", express.static(__dirname + "/uploads"));
//------------------------------------//
// Run Templet Engine
// app.set('view engine', 'ejs');
//------------------------------------//
const console_stamp = require("console-stamp");
console_stamp(console, {
  pattern: "YYYY-MM-DD HH:mm:ss",
  formatter: function () { return moment().format("YYYY-MM-DD HH:mm:ss"); }
});
//allow methods for postman
app.use(allowed_methods);
//------------------------------------//
morgan.token("date", function () {
  return moment().format("YYYY-MM-DD HH:mm:ss");
});
morgan.token("status", function (req, res) {
  const status = (typeof res.headersSent !== "boolean" ? Boolean(res._header) : res.headersSent) ? res.statusCode : undefined;
  const color = status >= 500 ? 31 : status >= 400 ? 33 : status >= 300 ? 36 : status >= 200 ? 32 : 0;
  return `\x1b[${color}m${status}\x1b[0m`;
});
app.use(morgan("[:date] [:method] :url :status :res[content-length] - :response-time ms"));
//------------------------------------//
app.use(request_getters);
app.use(request_parser);
//-Here we are getting the language from the request and align the request response acccording with that -//
// app.use(common.languageSet) // Uncomment when common helper is available

//------------------------------------//

app.post('/user/health', function (req, res, next) {
  console.log('health is fine');
  res.json(new Date())
})
app.use(function (req, res, next) {
  console.log("======> req.orgignalUrl : ", req.originalUrl);
  next();
});

//--------Modules route redirecting here for the request---------//
app.use("/api/v1/auth", require("./src/modules/auth/app.js")());
app.use("/api/v1/products", require("./src/modules/products/app.js")());
app.use("/api/v1/contact", require("./src/modules/contact/app.js")());
app.use("/api/v1/cart", require("./src/modules/cart/app.js")());
app.use("/api/v1/order", require("./src/modules/orders/app.js")());
app.use("/api/v1/address", require("./src/modules/address/app.js")());
app.use("/api/v1/users", require("./src/modules/user/app.js")());

//------Checking for the error comeback to main file before going to middleware---------//
app.use((err, req, res, next) => {
  console.log("📍 Error intercepted in main_app.js");
  console.log("Error type:", err.constructor.name);
  console.log("Error message:", err.message);
  console.log("Error stack :", err.stack);

  console.log("Original URL:", req.originalUrl);
  next(err); // pass it to the actual error-handling middleware
});

app.use(not_found);
app.use(require("./middleware/response_handler").errorHandler); // Using existing error handler
//------------------------------------//
const os = require("os");
//------------------------------------//
const sequelize = require('./db/sequelize/sequelize');
// const consumers = require("./helpers/topics_consumer");
console.log("Server host", os.hostname());
// console.log("database host", sequelize.connection.config.host);
//Here We are building the sequelize Db connection
sequelize.connection.authenticate().then(async function () {
  console.log("DB Connection Successful");
  //Sync the db tables with the models here 
  // await sequelize.sync() // Use with caution in production
  app.listen(process.env.PORT, async function (error) {
    if (error) { console.log("Server is not listening...", error); }
    else {
      console.log("Server is listening on HOST", os.hostname(), "on PORT", process.env.PORT);
    }
  });
}).catch(function (error) { console.log("Unable to connect to database", error); });
//------------------------------------//
module.exports = app;