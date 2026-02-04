'use strict';

/**
 * Migration: Update activity_logs user_id column
 * Change user_id from VARCHAR(128) to INT UNSIGNED to reference users.id
 */
module.exports = {
    async up(queryInterface, Sequelize) {
        // First, need to handle existing data - clear old string user_ids
        await queryInterface.sequelize.query(`
            UPDATE activity_logs SET user_id = NULL WHERE user_id IS NOT NULL
        `);

        // Modify the column type from VARCHAR to INT UNSIGNED
        await queryInterface.changeColumn('activity_logs', 'user_id', {
            type: Sequelize.INTEGER.UNSIGNED,
            allowNull: true
        });

        // Add index for better query performance (if not exists)
        try {
            await queryInterface.addIndex('activity_logs', ['user_id'], {
                name: 'idx_activity_logs_user_id_int'
            });
        } catch (e) {
            console.log('Index might already exist, skipping...');
        }
    },

    async down(queryInterface, Sequelize) {
        // Remove the index first
        try {
            await queryInterface.removeIndex('activity_logs', 'idx_activity_logs_user_id_int');
        } catch (e) {
            console.log('Index might not exist, skipping...');
        }

        // Revert column type back to VARCHAR
        await queryInterface.changeColumn('activity_logs', 'user_id', {
            type: Sequelize.STRING(128),
            allowNull: true
        });
    }
};
