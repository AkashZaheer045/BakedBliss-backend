"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: { type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      user_id: { type: Sequelize.STRING(128), allowNull: false, unique: true },
      full_name: { type: Sequelize.STRING(255), allowNull: false },
      email: { type: Sequelize.STRING(255), allowNull: true, unique: true },
      profile_picture: { type: Sequelize.STRING(1024), allowNull: true },
      phone_number: { type: Sequelize.STRING(64), allowNull: true },
      addresses: { type: Sequelize.JSON, allowNull: true },
      selected_address_id: { type: Sequelize.STRING(128), allowNull: true },
      role: { type: Sequelize.STRING(64), allowNull: false, defaultValue: 'user' },
      push_token: { type: Sequelize.STRING(512), allowNull: true },
      date_joined: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: true },
      deleted_at: { type: Sequelize.DATE, allowNull: true }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  }
};
