let connection = null;
let sequelize = require("sequelize");
let configFull = require("./../../config/database");
let env = process.env.NODE_ENV || 'development';
let config = configFull[env];

let dbConfig = {
    host: config.host,
    port: config.port,
    logging: config.logging,
    dialect: config.dialect,
    pool: config.pool,
    dialectOptions: config.dialectOptions,
    omitNull: true,
    benchmark: true,
    define: {
        paranoid: true,
        timestamp: true,
        subQuery: false,
        underscored: true,
        duplicating: false,
        underscoredAll: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        deletedAt: "deleted_at",
        defaultScope: {
            omitNull: true,
            benchmark: true,
            paranoid: false,
            subQuery: false,
            duplicating: false,
            where: { deleted_at: null },
            attributes: { exclude: ["deleted_at"] }
        }
    }
};

if (!connection) {
    connection = new sequelize(
        config.database,
        config.username,
        config.password,
        dbConfig
    );
}
module.exports = {
    config,
    sequelize,
    connection
};
