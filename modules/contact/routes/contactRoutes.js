const express = require('express');
const { submitContactForm } = require('../controllers/contactController');

const router = express.Router();

// Define the route for Contact Us form submission
router.post('/contact-us', submitContactForm);

module.exports = router;
