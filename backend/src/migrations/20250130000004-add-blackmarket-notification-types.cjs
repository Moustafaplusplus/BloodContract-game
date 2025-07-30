'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add black market notification types to the ENUM
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_Notifications_type" ADD VALUE IF NOT EXISTS 'BLACKMARKET_LISTING_POSTED';
    `);
    
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_Notifications_type" ADD VALUE IF NOT EXISTS 'BLACKMARKET_LISTING_SOLD';
    `);
    
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_Notifications_type" ADD VALUE IF NOT EXISTS 'BLACKMARKET_LISTING_CANCELLED';
    `);
    
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_Notifications_type" ADD VALUE IF NOT EXISTS 'BLACKMARKET_ITEM_PURCHASED';
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Note: PostgreSQL doesn't support removing ENUM values easily
    // This is a limitation - we can't easily rollback ENUM additions
    console.log('Warning: Cannot remove ENUM values in PostgreSQL');
  }
}; 