/**
 * Model Scopes
 * Defines reusable query scopes for models
 * Usage: models.users.scope('active').findAll()
 */
module.exports = function (models) {
    // User scopes
    if (models.users) {
        models.users.addScope('active', {
            where: {
                deleted_at: null
            }
        });

        models.users.addScope('admins', {
            where: {
                role: 'admin',
                deleted_at: null
            }
        });

        models.users.addScope('customers', {
            where: {
                role: 'user',
                deleted_at: null
            }
        });
    }

    // Product scopes
    if (models.products) {
        models.products.addScope('available', {
            where: {
                deleted_at: null
            }
        });

        models.products.addScope('inStock', {
            where: {
                stock: { [require('sequelize').Op.gt]: 0 },
                deleted_at: null
            }
        });

        models.products.addScope('featured', {
            where: {
                isFeatured: true,
                deleted_at: null
            }
        });

        models.products.addScope('onSale', {
            where: {
                sale_price: { [require('sequelize').Op.ne]: null },
                deleted_at: null
            }
        });

        models.products.addScope('byCategory', category => ({
            where: {
                category: category,
                deleted_at: null
            }
        }));
    }

    // Order scopes
    if (models.orders) {
        models.orders.addScope('pending', {
            where: {
                status: 'Pending',
                deleted_at: null
            }
        });

        models.orders.addScope('completed', {
            where: {
                status: 'Delivered',
                deleted_at: null
            }
        });

        models.orders.addScope('recent', {
            order: [['created_at', 'DESC']],
            limit: 10
        });
    }

    // Cart scopes
    if (models.carts) {
        models.carts.addScope('active', {
            where: {
                deleted_at: null
            }
        });
    }

    console.log('✅ Model scopes initialized');
};
