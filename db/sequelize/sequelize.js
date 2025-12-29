let { config, sequelize, connection } = require("./connection");

let models = {
    users: (require("./../schemas/users"))(connection, sequelize),
    products: (require("./../schemas/products"))(connection, sequelize),
    orders: (require("./../schemas/orders"))(connection, sequelize),
    carts: (require("./../schemas/carts"))(connection, sequelize),
    favorites: (require("./../schemas/favorites"))(connection, sequelize),
    contact_messages: (require("./../schemas/contact_messages"))(connection, sequelize),
};

(require("./hooks"))(models);
(require("./scopes"))(models);
(require("./associations"))(models);

module.exports = {
    config,
    sequelize,
    connection,
    models
};
