// Load environment variables FIRST before any other imports
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');  // For enabling CORS
const helmet = require('helmet');  // For securing HTTP headers
const morgan = require('morgan');  // For logging requests
const { initializeDatabase } = require('./config/sequelizeConfig');  // Initialize database
const authRoutes = require('./src/modules/auth/routes/authRoutes');
const contactRoutes = require('./src/modules/contact/routes/contactRoutes');
const productRoutes = require('./src/modules/products/routes/productRoutes');
const cartRoutes = require('./src/modules/cart/routes/cartRoutes');
const orderRoutes = require('./src/modules/orders/routes/orderRoutes');
const addressRoutes = require('./src/modules/address/routes/addressRoutes');
const userRoutes = require('./src/modules/user/routes/userRoutes');

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
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/contact', contactRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/order', orderRoutes);
app.use('/api/v1/address', addressRoutes);
app.use('/api/v1/users', userRoutes);


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