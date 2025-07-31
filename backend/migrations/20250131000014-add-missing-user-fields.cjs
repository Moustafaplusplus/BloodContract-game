'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add missing fields to Users table
    await queryInterface.addColumn('Users', 'googleId', {
      type: Sequelize.STRING,
      unique: true,
      allowNull: true
    });

    await queryInterface.addColumn('Users', 'isBanned', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });

    await queryInterface.addColumn('Users', 'banReason', {
      type: Sequelize.TEXT,
      defaultValue: ''
    });

    await queryInterface.addColumn('Users', 'bannedAt', {
      type: Sequelize.DATE,
      defaultValue: null
    });

    await queryInterface.addColumn('Users', 'isIpBanned', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });

    await queryInterface.addColumn('Users', 'ipBanReason', {
      type: Sequelize.TEXT,
      defaultValue: ''
    });

    await queryInterface.addColumn('Users', 'ipBannedAt', {
      type: Sequelize.DATE,
      defaultValue: null
    });

    await queryInterface.addColumn('Users', 'lastIpAddress', {
      type: Sequelize.STRING,
      defaultValue: null
    });

    await queryInterface.addColumn('Users', 'chatMutedUntil', {
      type: Sequelize.DATE,
      defaultValue: null
    });

    await queryInterface.addColumn('Users', 'chatBannedUntil', {
      type: Sequelize.DATE,
      defaultValue: null
    });

    await queryInterface.addColumn('Users', 'bio', {
      type: Sequelize.TEXT,
      defaultValue: ''
    });

    await queryInterface.addColumn('Users', 'money', {
      type: Sequelize.INTEGER,
      defaultValue: 0
    });

    await queryInterface.addColumn('Users', 'blackcoins', {
      type: Sequelize.INTEGER,
      defaultValue: 0
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the added columns
    await queryInterface.removeColumn('Users', 'googleId');
    await queryInterface.removeColumn('Users', 'isBanned');
    await queryInterface.removeColumn('Users', 'banReason');
    await queryInterface.removeColumn('Users', 'bannedAt');
    await queryInterface.removeColumn('Users', 'isIpBanned');
    await queryInterface.removeColumn('Users', 'ipBanReason');
    await queryInterface.removeColumn('Users', 'ipBannedAt');
    await queryInterface.removeColumn('Users', 'lastIpAddress');
    await queryInterface.removeColumn('Users', 'chatMutedUntil');
    await queryInterface.removeColumn('Users', 'chatBannedUntil');
    await queryInterface.removeColumn('Users', 'bio');
    await queryInterface.removeColumn('Users', 'money');
    await queryInterface.removeColumn('Users', 'blackcoins');
  }
}; 