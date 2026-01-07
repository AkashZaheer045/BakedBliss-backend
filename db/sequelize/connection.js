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
const env = process.env.NODE_ENV || 'development';

let config;

// Priority 1: Environment Variables (Production/Vercel)
if (process.env.DB_HOST) {
    console.log('Using Environment Variables for Database Config');
    config = {
        name: process.env.DB_NAME || process.env.MYSQL_DATABASE,
        user: process.env.DB_USER || process.env.MYSQL_USER,
        pass: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD,
        host: process.env.DB_HOST || process.env.MYSQL_HOST,
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        // Use defaults from localhost config for define/options if needed, or set standard ones
        define: {
            paranoid: true,
            timestamps: true,
            underscored: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
            deletedAt: "deleted_at"
        }
    };
} else {
    // Priority 2: config.json (Local Development)
    let localEnv = env;
    if (localEnv === 'development') {
        localEnv = 'localhost';
    }
    config = configFull[localEnv];
}

if (!config) {
    console.error(`❌ No database configuration found for environment: ${env}`);
    throw new Error('Database configuration missing');
}

// Create connection singleton
if (!connection) {
    connection = new Sequelize(config.name, config.user, config.pass, {
        host: config.host,
        port: config.port,
        dialect: config.dialect || 'mysql',
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
