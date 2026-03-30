'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Normalize role values before enforcing strict enum.
        await queryInterface.sequelize.query(`
            UPDATE users
            SET role = LOWER(role)
            WHERE role IS NOT NULL
        `);

        await queryInterface.sequelize.query(`
            UPDATE users
            SET role = 'user'
            WHERE role IS NULL OR role NOT IN ('user', 'admin')
        `);

        await queryInterface.changeColumn('users', 'role', {
            type: Sequelize.ENUM('user', 'admin'),
            allowNull: false,
            defaultValue: 'user'
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('users', 'role', {
            type: Sequelize.STRING(64),
            allowNull: false,
            defaultValue: 'user'
        });
    }
};
