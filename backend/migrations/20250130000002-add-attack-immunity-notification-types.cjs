'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Add ATTACK_IMMUNITY_ACTIVATED to the enum
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_Notifications_type" ADD VALUE 'ATTACK_IMMUNITY_ACTIVATED';
      `);
      console.log('ATTACK_IMMUNITY_ACTIVATED enum value added successfully');
    } catch (error) {
      console.log('ATTACK_IMMUNITY_ACTIVATED enum value might already exist:', error.message);
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // Note: PostgreSQL doesn't support removing enum values easily
      console.log('Warning: Cannot remove enum value ATTACK_IMMUNITY_ACTIVATED from enum_Notifications_type');
    } catch (error) {
      console.log('Error in down migration:', error.message);
    }
  }
}; 