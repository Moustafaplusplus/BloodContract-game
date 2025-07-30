'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Update the type enum to include NAME_CHANGE
    try {
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_SpecialItems_type" ADD VALUE 'NAME_CHANGE';
      `);
    } catch (error) {
      // If the enum value already exists, ignore the error
      console.log('NAME_CHANGE enum value might already exist:', error.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Note: Removing enum values is complex and depends on the database system
    // This is a simplified rollback
    console.log('Note: NAME_CHANGE enum value removal requires manual intervention');
  }
}; 