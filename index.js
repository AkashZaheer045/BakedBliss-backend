// Load environment variables FIRST before any other imports
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');  // For enabling CORS
const helmet = require('helmet');  // For securing HTTP headers
const morgan = require('morgan');  // For logging requests
const authRoutes = require('./modules/auth/routes/authRoutes');
const contactRoutes = require('./modules/contact/routes/contactRoutes');
const productRoutes = require('./modules/products/routes/productRoutes');
const cartRoutes = require('./modules/cart/routes/cartRoutes');
const orderRoutes = require('./modules/orders/routes/orderRoutes');
const addressRoutes = require('./modules/address/routes/addressRoutes');
const userRoutes = require('./modules/user/routes/userRoutes');

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


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ status: 'error', message: 'Something went wrong!' });
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});