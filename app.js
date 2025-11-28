// Load environment variables FIRST before any other imports
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');  // For enabling CORS
const helmet = require('helmet');  // For securing HTTP headers
const morgan = require('morgan');  // For logging requests
const { initializeDatabase } = require('./config/sequelizeConfig');  // Initialize database

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());  // Enable CORS
app.use(helmet());  // Secure HTTP headers
app.use(morgan('tiny'));  // Log requests


// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});



// All routes of the application main functionality
// Each module's `app.js` exports an object { routes } where `routes` is an Express Router.
// Mount the router itself (module.exports.routes) so Express receives a Router instance.
app.use('/api/v1/auth', require('./src/modules/auth/app').routes);
app.use('/api/v1/products', require('./src/modules/products/app').routes);
app.use('/api/v1/contact', require('./src/modules/contact/app').routes);
app.use('/api/v1/cart', require('./src/modules/cart/app').routes);
app.use('/api/v1/order', require('./src/modules/orders/app').routes);
app.use('/api/v1/address', require('./src/modules/address/app').routes);
app.use('/api/v1/users', require('./src/modules/user/app').routes);


// Import error handlers
const { errorHandler, notFoundHandler } = require('./middleware/response_handler');

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Centralized error handling middleware (must be last)
app.use(errorHandler);


// Initialize database and start server
const startServer = async () => {
  try {
    // Initialize database connection
    await initializeDatabase();

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();