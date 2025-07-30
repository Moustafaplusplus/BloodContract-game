'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add GANG_BOMB to the enum
    try {
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_SpecialItems_type" ADD VALUE 'GANG_BOMB';
      `);
    } catch (error) {
      // If the enum value already exists, ignore the error
      console.log('GANG_BOMB enum value might already exist:', error.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Note: PostgreSQL doesn't support removing enum values easily
    // This is a limitation - we can't easily rollback enum additions
    console.log('Warning: Cannot remove enum value GANG_BOMB from enum_SpecialItems_type');
  }
}; 