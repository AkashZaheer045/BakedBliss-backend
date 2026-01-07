'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('users', 'password', {
            type: Sequelize.STRING(1024),
            allowNull: true // Allow null for existing users or social login
        });
        await queryInterface.addColumn('users', 'salt', {
            type: Sequelize.STRING(512),
            allowNull: true // Allow null for existing users or social login
        });
    },

    down: async (queryInterface, _Sequelize) => {
        await queryInterface.removeColumn('users', 'password');
        await queryInterface.removeColumn('users', 'salt');
    }
};
