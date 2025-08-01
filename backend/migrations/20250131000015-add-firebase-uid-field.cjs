'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'firebaseUid', {
      type: Sequelize.STRING,
      unique: true,
      allowNull: true,
      after: 'password'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'firebaseUid');
  }
}; 