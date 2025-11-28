let connection = null;
let sequelize = require("sequelize");
let configFull = require("./../../config/config.json");
let env = process.env.NODE_ENV || 'development';
if (env === 'development') env = 'localhost';
let config = configFull[env];

if (!connection) {
    connection = new sequelize(
        config.name,
        config.user,
        config.pass,
        config
    );
}
module.exports = {
    config,
    sequelize,
    connection
};
