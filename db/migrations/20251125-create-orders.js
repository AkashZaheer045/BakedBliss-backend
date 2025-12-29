"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('orders', {
      id: { type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      order_id: { type: Sequelize.STRING(128), allowNull: false, unique: true },
      user_id: { type: Sequelize.STRING(128), allowNull: false },
      cart_items: { type: Sequelize.JSON, allowNull: false },
      delivery_address: { type: Sequelize.JSON, allowNull: true },
      status: { type: Sequelize.STRING(64), allowNull: false, defaultValue: 'Pending' },
      total_amount: { type: Sequelize.FLOAT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: true },
      deleted_at: { type: Sequelize.DATE, allowNull: true }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('orders');
  }
};
