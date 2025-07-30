'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add new notification types to the ENUM
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_Notifications_type" ADD VALUE IF NOT EXISTS 'GHOST_ASSASSINATED';
    `);
    
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_Notifications_type" ADD VALUE IF NOT EXISTS 'CONTRACT_ATTEMPTED';
    `);
    
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_Notifications_type" ADD VALUE IF NOT EXISTS 'CONTRACT_EXPIRED';
    `);
    
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_Notifications_type" ADD VALUE IF NOT EXISTS 'CONTRACT_TARGET_ASSASSINATED';
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Note: PostgreSQL doesn't support removing ENUM values easily
    // This is a limitation - we can't easily rollback ENUM additions
    console.log('Warning: Cannot remove ENUM values in PostgreSQL');
  }
}; 