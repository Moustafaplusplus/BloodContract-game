'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Add gang bomb notification types
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_Notifications_type" ADD VALUE IF NOT EXISTS 'GANG_BOMB_USED';
      `);
    } catch (error) {
      console.log('GANG_BOMB_USED enum value might already exist:', error.message);
    }

    try {
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_Notifications_type" ADD VALUE IF NOT EXISTS 'GANG_BOMBED';
      `);
    } catch (error) {
      console.log('GANG_BOMBED enum value might already exist:', error.message);
    }

    try {
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_Notifications_type" ADD VALUE IF NOT EXISTS 'GANG_BOMB_HOSPITALIZED';
      `);
    } catch (error) {
      console.log('GANG_BOMB_HOSPITALIZED enum value might already exist:', error.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    console.log('Warning: Cannot remove enum values from enum_Notifications_type');
  }
}; 