'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Add ATTACK_IMMUNITY_PROTECTED to the enum
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_Notifications_type" ADD VALUE 'ATTACK_IMMUNITY_PROTECTED';
      `);
      console.log('ATTACK_IMMUNITY_PROTECTED enum value added successfully');
    } catch (error) {
      console.log('ATTACK_IMMUNITY_PROTECTED enum value might already exist:', error.message);
    }

    try {
      // Add GANG_BOMB_IMMUNITY_PROTECTED to the enum
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_Notifications_type" ADD VALUE 'GANG_BOMB_IMMUNITY_PROTECTED';
      `);
      console.log('GANG_BOMB_IMMUNITY_PROTECTED enum value added successfully');
    } catch (error) {
      console.log('GANG_BOMB_IMMUNITY_PROTECTED enum value might already exist:', error.message);
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // Note: PostgreSQL doesn't support removing enum values easily
      console.log('Warning: Cannot remove enum values ATTACK_IMMUNITY_PROTECTED and GANG_BOMB_IMMUNITY_PROTECTED from enum_Notifications_type');
    } catch (error) {
      console.log('Error in down migration:', error.message);
    }
  }
}; 