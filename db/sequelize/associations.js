/**
 * Model Associations
 * Defines relationships between models (belongsTo, hasMany, hasOne, belongsToMany)
 * This allows for eager loading with include: [{ model: db.model_name, as: 'alias' }]
 */
module.exports = function (db) {
    // User <-> Orders Association
    db.users.hasMany(db.orders, {
        foreignKey: 'user_id',
        sourceKey: 'user_id',
        as: 'orders'
    });
    db.orders.belongsTo(db.users, {
        foreignKey: 'user_id',
        targetKey: 'user_id',
        as: 'user'
    });

    // User <-> Cart Association (One-to-One)
    db.users.hasOne(db.carts, {
        foreignKey: 'user_id',
        sourceKey: 'user_id',
        as: 'cart'
    });
    db.carts.belongsTo(db.users, {
        foreignKey: 'user_id',
        targetKey: 'user_id',
        as: 'user'
    });

    // User <-> Favorites Association
    db.users.hasMany(db.favorites, {
        foreignKey: 'user_id',
        sourceKey: 'user_id',
        as: 'favorites'
    });
    db.favorites.belongsTo(db.users, {
        foreignKey: 'user_id',
        targetKey: 'user_id',
        as: 'user'
    });

    // Product <-> Favorites Association
    db.products.hasMany(db.favorites, {
        foreignKey: 'product_id',
        as: 'favorites'
    });
    db.favorites.belongsTo(db.products, {
        foreignKey: 'product_id',
        as: 'product'
    });

    // User <-> Contact Messages Association (optional)
    db.users.hasMany(db.contact_messages, {
        foreignKey: 'user_id',
        as: 'messages'
    });
    db.contact_messages.belongsTo(db.users, {
        foreignKey: 'user_id',
        as: 'user'
    });
    // console.log('✅ Model associations initialized');
};
