module.exports = (models) => {
    const { users, products, orders, carts, favorites } = models;

    // Users <-> Orders
    users.hasMany(orders, { foreignKey: 'user_id', sourceKey: 'user_id', as: 'orders' });
    orders.belongsTo(users, { foreignKey: 'user_id', targetKey: 'user_id', as: 'user' });

    // Users <-> Carts
    users.hasOne(carts, { foreignKey: 'user_id', sourceKey: 'user_id', as: 'cart' });
    carts.belongsTo(users, { foreignKey: 'user_id', targetKey: 'user_id', as: 'user' });

    // Users <-> Favorites
    users.hasMany(favorites, { foreignKey: 'user_id', sourceKey: 'user_id', as: 'favorites' });
    favorites.belongsTo(users, { foreignKey: 'user_id', targetKey: 'user_id', as: 'user' });

    // Products <-> Favorites
    products.hasMany(favorites, { foreignKey: 'product_id', as: 'favorited_by' });
    favorites.belongsTo(products, { foreignKey: 'product_id', as: 'product' });
};
