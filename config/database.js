require('dotenv').config();

module.exports = {
    development: {
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'baked_bliss_dev',
        host: process.env.DB_HOST || '127.0.0.1',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: process.env.DB_LOGGING === 'true' ? console.log : false,
        pool: {
            max: 10,
            min: 0,
            acquire: 60000,
            idle: 30000,
            evict: 2000,
            handleDisconnects: true
        },
        dialectOptions: {
            charset: 'utf8mb4'
        },
        define: {
            timestamps: true,
            underscored: true,
            paranoid: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            deletedAt: 'deleted_at'
        }
    },
    staging: {
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'baked_bliss_staging',
        host: process.env.DB_HOST || '127.0.0.1',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: false,
        pool: {
            max: 10,
            min: 0,
            acquire: 60000,
            idle: 30000,
            evict: 2000,
            handleDisconnects: true
        },
        dialectOptions: {
            charset: 'utf8mb4'
        },
        define: {
            timestamps: true,
            underscored: true,
            paranoid: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            deletedAt: 'deleted_at'
        }
    },
    production: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: false,
        pool: {
            max: 20,
            min: 5,
            acquire: 60000,
            idle: 30000,
            evict: 2000,
            handleDisconnects: true
        },
        dialectOptions: {
            charset: 'utf8mb4',
            ssl:
                process.env.DB_SSL === 'true'
                    ? {
                          require: true,
                          rejectUnauthorized: false
                      }
                    : false
        },
        define: {
            timestamps: true,
            underscored: true,
            paranoid: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            deletedAt: 'deleted_at'
        }
    }
};
