/**
 * Sequelize Database Module - Main Entry Point
 *
 * Exports: { config, Sequelize, connection, models, db }
 *
 * Usage in controllers/services:
 *   const { models, connection, db } = require('../../db/sequelize/sequelize');
 *
 * Simple queries:
 *   await models.users.findOne({ where: { id: userId } });
 *
 * Using db instance wrapper:
 *   const userInstance = new db(models.users);
 *   const [user, err] = await userInstance.findOne({ where: { email } });
 *
 * Eager loading:
 *   await models.orders.findOne({
 *     where: { id: orderId },
 *     include: [{ model: models.users, as: 'user' }]
 *   });
 *
 * Transactions:
 *   await connection.transaction(async (t) => {
 *     await models.orders.create({...}, { transaction: t });
 *   });
 */

const { config, Sequelize, connection } = require('./connection');

// Load all models
const models = {
    users: require('./../schemas/users')(connection, Sequelize),
    products: require('./../schemas/products')(connection, Sequelize),
    orders: require('./../schemas/orders')(connection, Sequelize),
    carts: require('./../schemas/carts')(connection, Sequelize),
    favorites: require('./../schemas/favorites')(connection, Sequelize),
    contact_messages: require('./../schemas/contact_messages')(connection, Sequelize)
};

// Apply hooks (lifecycle callbacks)
require('./hooks')(models);

// Apply scopes (reusable query filters)
require('./scopes')(models);

// Apply associations (relationships between models)
require('./associations')(models);

// Database instance wrapper class
const DatabaseInstance = require('./instance');

// console.log('✅ Sequelize models loaded:', Object.keys(models).join(', '));

module.exports = {
    config,
    Sequelize,
    connection,
    models,
    db: DatabaseInstance
};
