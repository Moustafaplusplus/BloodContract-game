'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Add ATTACK_IMMUNITY to the enum
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_SpecialItems_type" ADD VALUE 'ATTACK_IMMUNITY';
      `);
      console.log('ATTACK_IMMUNITY enum value added successfully');
    } catch (error) {
      console.log('ATTACK_IMMUNITY enum value might already exist:', error.message);
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // Note: PostgreSQL doesn't support removing enum values easily
      // This would require recreating the enum type
      console.log('Warning: Cannot remove enum value ATTACK_IMMUNITY from enum_SpecialItems_type');
    } catch (error) {
      console.log('Error in down migration:', error.message);
    }
  }
}; 