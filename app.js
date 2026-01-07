/**
 * Baked Bliss Backend - Main Application
 * Per QAutos pattern: Centralized auth, endpoint registry, and route handling
 */
const cors = require('cors');
const morgan = require('morgan');
const moment = require('moment');
const express = require('express');
const bodyParser = require('body-parser');

require('dotenv').config();
const app = express();

// Middleware imports
const { requestLogger } = require('./middleware/request_logger');
const authMiddleware = require('./middleware/auth');
const { errorHandler } = require('./middleware/response_handler');

//------------------------------------//
// CORS Configuration
//------------------------------------//
app.use(cors({ optionsSuccessStatus: 200 }));

//------------------------------------//
// Body Parsing
//------------------------------------//
app.use(express.json({ limit: '30mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

//------------------------------------//
// Static Files
//------------------------------------//
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use('/public', express.static(__dirname + '/public'));

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
// HTTP Method Validation
//------------------------------------//
const allowedMethods = (req, res, next) => {
    req.req_start_time = new Date().toISOString();
    const allowed = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];
    return allowed.includes(req.method) ? next() : next(405);
};
app.use(allowedMethods);

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
app.post('/user/health', function (req, res) {
    console.log('health is fine');
    res.json(new Date());
});

app.get('/health', function (req, res) {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
});

//------------------------------------//
// ENDPOINT REGISTRY
// Per QAutos pattern: Register all valid endpoints upfront
// This enables validation before hitting auth
//------------------------------------//
const _endPoints = {
    auth: [
        'login',
        'register',
        'signup',
        'verify-otp',
        'resend-otp',
        'forgot-password',
        'reset-password',
        'google-login',
        'logout',
        'refresh-token',
        'change-password'
    ],
    products: [
        'search',
        'categories',
        'trending',
        'upload',
        'category'
        // Note: Dynamic routes like /:id are handled separately
    ],
    cart: ['add', 'remove', 'update', 'clear', 'items'],
    order: ['create', 'history', 'details', 'cancel', 'status'],
    address: ['add', 'update', 'delete', 'list', 'default'],
    users: ['profile', 'update-profile', 'favorites', 'add-favorite', 'remove-favorite'],
    contact: ['submit', 'list'],
    admin: ['dashboard', 'users', 'orders', 'products']
};

//------------------------------------//
// Request Logger with Trace ID
//------------------------------------//
app.use(requestLogger);

//------------------------------------//
// Request URL Logger
//------------------------------------//
app.use(function (req, res, next) {
    console.log('======> req.originalUrl:', req.originalUrl);
    next();
});

//------------------------------------//
// CENTRALIZED AUTHENTICATION MIDDLEWARE
// Per QAutos pattern: Auth is handled here, NOT at route level
// Public paths are defined in middleware/auth.js
//------------------------------------//
app.use(authMiddleware);

//------------------------------------//
// MODULE ROUTES
// Per QAutos pattern: Clean route registration, no auth at route level
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
app.use(errorHandler);

//------------------------------------//
// Server Initialization
//------------------------------------//
const os = require('os');
const sequelize = require('./db/sequelize/sequelize');

console.log('Server host:', os.hostname());

sequelize.connection
    .authenticate()
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
