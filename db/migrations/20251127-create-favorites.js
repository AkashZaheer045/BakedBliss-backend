'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('favorites', {
            id: {
                type: Sequelize.INTEGER.UNSIGNED,
                primaryKey: true,
                autoIncrement: true
            },
            user_id: {
                type: Sequelize.STRING(128),
                allowNull: false
            },
            product_id: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: true
            },
            deleted_at: {
                type: Sequelize.DATE,
                allowNull: true
            }
        });

        // Add composite unique index
        await queryInterface.addIndex('favorites', ['user_id', 'product_id'], {
            unique: true,
            name: 'unique_user_product'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('favorites');
    }
};
