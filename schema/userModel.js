// Firebase doesn't require a model schema like Mongoose
const db = require('../config/firebaseConfig');

const User = db.collection('User');

module.exports = User; // Export the User collection for use in controllers
