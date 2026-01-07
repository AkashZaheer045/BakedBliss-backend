'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('carts', {
            id: { type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
            user_id: { type: Sequelize.STRING(128), allowNull: false },
            items: { type: Sequelize.JSON, allowNull: false },
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
        await queryInterface.dropTable('carts');
    }
};
