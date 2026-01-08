'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Orders Indexes
        await queryInterface.addIndex('orders', ['created_at'], { name: 'idx_orders_created_at' });
        await queryInterface.addIndex('orders', ['status'], { name: 'idx_orders_status' });
        await queryInterface.addIndex('orders', ['user_id'], { name: 'idx_orders_user_id' });
        await queryInterface.addIndex('orders', ['deleted_at'], { name: 'idx_orders_deleted_at' });

        // Users Indexes
        await queryInterface.addIndex('users', ['role'], { name: 'idx_users_role' });
        await queryInterface.addIndex('users', ['created_at'], { name: 'idx_users_created_at' });
        await queryInterface.addIndex('users', ['is_active'], { name: 'idx_users_is_active' });

        // Activity Logs Indexes (since we just added the table)
        await queryInterface.addIndex('activity_logs', ['created_at'], { name: 'idx_activity_logs_created_at' });
        await queryInterface.addIndex('activity_logs', ['user_id'], { name: 'idx_activity_logs_user_id' });
    },

    down: async (queryInterface, Sequelize) => {
        // Remove Orders Indexes
        await queryInterface.removeIndex('orders', 'idx_orders_created_at');
        await queryInterface.removeIndex('orders', 'idx_orders_status');
        await queryInterface.removeIndex('orders', 'idx_orders_user_id');
        await queryInterface.removeIndex('orders', 'idx_orders_deleted_at');

        // Remove Users Indexes
        await queryInterface.removeIndex('users', 'idx_users_role');
        await queryInterface.removeIndex('users', 'idx_users_created_at');
        await queryInterface.removeIndex('users', 'idx_users_is_active');

        // Remove Activity Logs Indexes
        await queryInterface.removeIndex('activity_logs', 'idx_activity_logs_created_at');
        await queryInterface.removeIndex('activity_logs', 'idx_activity_logs_user_id');
    }
};
