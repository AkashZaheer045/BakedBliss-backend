const { Sequelize } = require('sequelize');
require('dotenv').config();
const configFull = require('./config/config.json');

// Get config
const env = process.env.NODE_ENV || 'development';
let config;
if (process.env.DB_HOST) {
    config = {
        name: process.env.DB_NAME || process.env.MYSQL_DATABASE,
        user: process.env.DB_USER || process.env.MYSQL_USER,
        pass: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD,
        host: process.env.DB_HOST || process.env.MYSQL_HOST,
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql'
    };
} else {
    config = configFull[env];
}

console.log('Connecting to:', config.host);

const sequelize = new Sequelize(config.name, config.user, config.pass, {
    host: config.host,
    port: config.port,
    dialect: config.dialect
});

async function check() {
    try {
        await sequelize.authenticate();
        console.log('Connection successful.');
        const [users] = await sequelize.query('SELECT id, email, role FROM users');
        console.log('Users in DB:', users);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

check();
