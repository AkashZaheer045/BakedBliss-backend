/**
 * Database Connection Module
 * Creates and exports the Sequelize connection instance
 */
let connection = null;
const Sequelize = require('sequelize');
// Explicitly require mysql2 for Vercel bundling
require('mysql2');
const configFull = require('./../../config/config.json');

// Determine environment
let env = process.env.NODE_ENV || 'development';
if (env === 'development') {
    env = 'localhost';
}

const config = configFull[env];

// Create connection singleton
if (!connection) {
    connection = new Sequelize(config.name, config.user, config.pass, {
        host: config.host,
        port: config.port,
        dialect: config.dialect,
        logging: config.logging ? console.log : false,
        pool: config.pool,
        dialectOptions: config.dialectOptions,
        define: config.define
    });

    console.log(`📦 Database connection created for: ${config.name}@${config.host}`);
}

module.exports = {
    config,
    Sequelize,
    connection
};
