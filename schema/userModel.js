const db = require('../config/firebaseConfig');
const User = db.collection('User');

// User data structure helper
function createUserData({ uid, name, email, phone, address, role = 'user', createdAt = new Date() }) {
  return {
    uid,
    name,
    email,
    phone,
    address,
    role,
    createdAt,
  };
}

module.exports = {
  User,
  createUserData,
};