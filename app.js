 const cors = require('cors');
const morgan = require('morgan');
const moment = require('moment');
const express = require('express');
const bodyParser = require('body-parser');
// Middleware imports
// const { requestLogger } = require('./middleware/request_logger');
const authMiddleware = require('./middleware/auth');
// const { apiLimiter } = require('./middleware/rate_limiter');
const { activityLogger } = require('./middleware/activity_logger');





require('dotenv').config();
const app = express();

// Trust the first proxy (Vercel/Heroku/AWS) - Required for correct IP resolution & rate limiting
app.set('trust proxy', 1);

//------------------------------------//
// CORS Configuration
//------------------------------------//
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  methods: process.env.CORS_METHODS.split(","),
  credentials: process.env.CORS_CREDENTIALS === "true",
  optionsSuccessStatus: 200
}));

app.options("*", cors());
app.use(function (req, res, next) {
    console.log("======> req.originalUrl Before express limit: ", req.originalUrl);
    next();
});
//------------------------------------//
// Body Parsing
//------------------------------------//
app.use(express.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

//------------------------------------//
// Static Files
//------------------------------------//
app.use('/uploads', express.static(__dirname + '/uploads'));

//------------------------------------//
// Global Rate Limiting
// 100 requests per 15 minutes per IP
//------------------------------------//
// app.use(apiLimiter);

//------------------------------------//
// Console Logging with Timestamp
//------------------------------------//
const console_stamp = require('console-stamp');
console_stamp(console, {
    pattern: 'YYYY-MM-DD HH:mm:ss',
    formatter: function () {
        return moment().format('YYYY-MM-DD HH:mm:ss');
    }
});

//------------------------------------//
// Morgan Request Logging
//------------------------------------//
morgan.token('date', function () {
    return moment().format('YYYY-MM-DD HH:mm:ss');
});
morgan.token('status', function (req, res) {
    const status = (typeof res.headersSent !== 'boolean' ? Boolean(res._header) : res.headersSent)
        ? res.statusCode
        : undefined;
    const color =
        status >= 500 ? 31 : status >= 400 ? 33 : status >= 300 ? 36 : status >= 200 ? 32 : 0;
    return `\x1b[${color}m${status}\x1b[0m`;
});
app.use(morgan('[:date] [:method] :url :status :res[content-length] - :response-time ms'));

//------------------------------------//
// Health Check Endpoints (before auth)
//------------------------------------//
app.post('/health', function (req, res) {
    console.log('health is fine');
    res.json(new Date());
});



//------------------------------------//
// ENDPOINT REGISTRY
// Per QAutos pattern: Register all valid endpoints upfront
// This enables validation before hitting auth
//------------------------------------//
// Endpoint registry removed — CORS and centralized routing are used instead

//------------------------------------//
// CENTRALIZED AUTHENTICATION MIDDLEWARE
// Per QAutos pattern: Auth is handled here, NOT at route level
// Public paths are defined in middleware/auth.js
//------------------------------------//
app.use(authMiddleware);

//------------------------------------//
// Logs all user activities to activity_logs table
//------------------------------------//
app.use(activityLogger);

//------------------------------------//
// MODULE ROUTES
//------------------------------------//
app.use('/api/v1/auth', require('./src/modules/auth/app.js')());
app.use('/api/v1/products', require('./src/modules/products/app.js')());
app.use('/api/v1/contact', require('./src/modules/contact/app.js')());
app.use('/api/v1/cart', require('./src/modules/cart/app.js')());
app.use('/api/v1/order', require('./src/modules/orders/app.js')());
app.use('/api/v1/address', require('./src/modules/address/app.js')());
app.use('/api/v1/users', require('./src/modules/user/app.js')());
app.use('/api/v1/admin', require('./src/modules/admin/app.js')());

//------------------------------------//
// Error Logging Middleware
//------------------------------------//
app.use((err, req, res, next) => {
    console.log('📍 Error intercepted in app.js');
    console.log('Error type:', err.constructor.name);
    console.log('Error message:', err.message);
    if (process.env.NODE_ENV !== 'production') {
        console.log('Error stack:', err.stack);
    }
    console.log('Original URL:', req.originalUrl);
    next(err);
});

//------------------------------------//
// 404 Not Found Handler
//------------------------------------//
app.use((req, res, _next) => {
    res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'The requested resource was not found'
    });
});

//------------------------------------//
// Centralized Error Handler
//------------------------------------//
const { errorHandler } = require('./middleware/response_handler');
app.use(errorHandler);

//------------------------------------//
// Server Initialization
//------------------------------------//
const os = require('os');
const sequelize = require('./db/sequelize/sequelize');

console.log('Server host:', os.hostname());

sequelize.connection.authenticate()
    .then(function () {
        console.log('DB Connection Successful');

        app.listen(process.env.PORT, function (error) {
            if (error) {
                console.log('Server is not listening...', error);
            } else {
                console.log(
                    'Server is listening on HOST',
                    os.hostname(),
                    'on PORT',
                    process.env.PORT
                );
            }
        });
    })
    .catch(function (error) {
        console.log('Unable to connect to database', error);
    });

//------------------------------------//
module.exports = app;
