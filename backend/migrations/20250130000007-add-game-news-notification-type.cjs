'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add GAME_NEWS to the notification types enum
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_Notifications_type" ADD VALUE 'GAME_NEWS';
    `);
  },

  async down(queryInterface, Sequelize) {
    // Note: PostgreSQL doesn't support removing enum values easily
    // This is a limitation of the migration system
    console.log('Cannot remove enum value in PostgreSQL');
  }
}; 