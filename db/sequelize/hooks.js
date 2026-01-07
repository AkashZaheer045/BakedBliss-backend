/**
 * Model Hooks
 * Defines lifecycle hooks for Sequelize models
 * (beforeCreate, afterUpdate, beforeDestroy, etc.)
 */
module.exports = function (models) {
    // User hooks
    if (models.users) {
        models.users.addHook('beforeCreate', 'setDefaults', (user, _options) => {
            if (!user.created_at) {
                user.created_at = new Date();
            }
        });

        models.users.addHook('beforeUpdate', 'updateTimestamp', (user, _options) => {
            user.updated_at = new Date();
        });
    }

    // Order hooks
    if (models.orders) {
        models.orders.addHook('beforeCreate', 'generateOrderId', (order, _options) => {
            if (!order.order_id) {
                order.order_id = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
            }
            if (!order.created_at) {
                order.created_at = new Date();
            }
        });

        models.orders.addHook('beforeUpdate', 'updateTimestamp', (order, _options) => {
            order.updated_at = new Date();
        });
    }

    // Cart hooks
    if (models.carts) {
        models.carts.addHook('beforeCreate', 'setCreatedAt', (cart, _options) => {
            if (!cart.created_at) {
                cart.created_at = new Date();
            }
        });

        models.carts.addHook('beforeUpdate', 'updateTimestamp', (cart, _options) => {
            cart.updated_at = new Date();
        });
    }

    // Product hooks
    if (models.products) {
        models.products.addHook('beforeCreate', 'setDefaults', (product, _options) => {
            if (!product.created_at) {
                product.created_at = new Date();
            }
            if (product.stock === undefined) {
                product.stock = 0;
            }
        });
    }

    console.log('✅ Model hooks initialized');
};
