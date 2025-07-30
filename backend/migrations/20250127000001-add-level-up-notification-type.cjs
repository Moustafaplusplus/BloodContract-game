'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add LEVEL_UP to the notification type enum
    try {
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_Notifications_type" ADD VALUE 'LEVEL_UP';
      `);
    } catch (error) {
      // If the enum value already exists, ignore the error
      console.log('LEVEL_UP enum value might already exist:', error.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Note: Removing enum values is complex and depends on the database system
    // This is a simplified rollback
    console.log('Note: LEVEL_UP enum value removal requires manual intervention');
  }
}; 