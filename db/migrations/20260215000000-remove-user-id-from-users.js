'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('users', 'user_id');
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('users', 'user_id', {
            type: Sequelize.STRING(128),
            allowNull: true, // Initially true to avoid errors, requires population
            unique: true
        });
    }
};
