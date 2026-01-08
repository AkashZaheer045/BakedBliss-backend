'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const table = await queryInterface.describeTable('users');

        if (!table.password) {
            await queryInterface.addColumn('users', 'password', {
                type: Sequelize.STRING(1024),
                allowNull: true
            });
        }

        if (!table.salt) {
            await queryInterface.addColumn('users', 'salt', {
                type: Sequelize.STRING(512),
                allowNull: true
            });
        }
    },

    down: async (queryInterface, _Sequelize) => {
        await queryInterface.removeColumn('users', 'password');
        await queryInterface.removeColumn('users', 'salt');
    }
};
