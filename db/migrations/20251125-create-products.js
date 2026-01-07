'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('products', {
            id: { type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
            title: { type: Sequelize.STRING(512), allowNull: false },
            price: { type: Sequelize.FLOAT, allowNull: false },
            sale_price: { type: Sequelize.FLOAT, allowNull: true },
            thumbnail: { type: Sequelize.STRING(1024), allowNull: true },
            rating: { type: Sequelize.FLOAT, allowNull: true },
            category: { type: Sequelize.STRING(255), allowNull: true },
            rating_count: { type: Sequelize.INTEGER, allowNull: true },
            ingredients: { type: Sequelize.JSON, allowNull: true },
            description: { type: Sequelize.TEXT, allowNull: true },
            tagline: { type: Sequelize.STRING(1024), allowNull: true },
            images: { type: Sequelize.JSON, allowNull: true },
            stock: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: { type: Sequelize.DATE, allowNull: true },
            deleted_at: { type: Sequelize.DATE, allowNull: true }
        });
    },

    down: async (queryInterface, _Sequelize) => {
        await queryInterface.dropTable('products');
    }
};
