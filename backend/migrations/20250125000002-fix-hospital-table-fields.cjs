'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if the old columns exist and rename them
    try {
      // Rename hpLost to hpLoss
      await queryInterface.renameColumn('Hospitals', 'hpLost', 'hpLoss');
    } catch (error) {
      // Column might not exist or already be named correctly
      console.log('hpLost column rename skipped:', error.message);
    }

    try {
      // Rename releaseAt to releasedAt
      await queryInterface.renameColumn('Hospitals', 'releaseAt', 'releasedAt');
    } catch (error) {
      // Column might not exist or already be named correctly
      console.log('releaseAt column rename skipped:', error.message);
    }
  },

  async down(queryInterface, Sequelize) {
    // Revert the changes if needed
    try {
      await queryInterface.renameColumn('Hospitals', 'hpLoss', 'hpLost');
    } catch (error) {
      console.log('hpLoss column rename reverted:', error.message);
    }

    try {
      await queryInterface.renameColumn('Hospitals', 'releasedAt', 'releaseAt');
    } catch (error) {
      console.log('releasedAt column rename reverted:', error.message);
    }
  }
}; 