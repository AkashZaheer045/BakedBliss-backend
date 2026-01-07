'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('contact_messages', {
            id: { type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
            full_name: { type: Sequelize.STRING(255), allowNull: false },
            email: { type: Sequelize.STRING(255), allowNull: false },
            message: { type: Sequelize.TEXT, allowNull: false },
            date: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
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
        await queryInterface.dropTable('contact_messages');
    }
};
