const { Sequelize } = require('sequelize');
const config = require('./database');

// Determine the environment
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Create Sequelize instance
const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: dbConfig.dialect,
        logging: dbConfig.logging,
        pool: dbConfig.pool,
        dialectOptions: dbConfig.dialectOptions,
        define: dbConfig.define
    }
);

// Import models
const User = require('../db/schemas/users')(sequelize, Sequelize.DataTypes);
const Product = require('../db/schemas/products')(sequelize, Sequelize.DataTypes);
const Order = require('../db/schemas/orders')(sequelize, Sequelize.DataTypes);
const Cart = require('../db/schemas/carts')(sequelize, Sequelize.DataTypes);
const ContactMessage = require('../db/schemas/contact_messages')(sequelize, Sequelize.DataTypes);
const Favorite = require('../db/schemas/favorites')(sequelize, Sequelize.DataTypes);

// Define associations if needed
// User.hasMany(Order, { foreignKey: 'user_id', sourceKey: 'user_id' });
// Order.belongsTo(User, { foreignKey: 'user_id', targetKey: 'user_id' });

// Test database connection
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection has been established successfully.');
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
    }
};

// Initialize database
const initializeDatabase = async () => {
    try {
        await testConnection();
        // Sync all models with database (use with caution in production)
        // await sequelize.sync({ alter: false });
        console.log('✅ All models were synchronized successfully.');
    } catch (error) {
        console.error('❌ Error synchronizing models:', error);
    }
};

module.exports = {
    sequelize,
    Sequelize,
    models: {
        User,
        Product,
        Order,
        Cart,
        ContactMessage,
        Favorite
    },
    initializeDatabase,
    testConnection
};
