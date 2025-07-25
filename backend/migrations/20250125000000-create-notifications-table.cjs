'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Notifications', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      type: {
        type: Sequelize.ENUM(
          'ATTACKED',
          'HOSPITALIZED', 
          'JAILED',
          'BANK_INTEREST',
          'JOB_SALARY',
          'BLACK_MARKET_SOLD',
          'MESSAGE_RECEIVED',
          'FRIEND_REQUEST_RECEIVED',
          'FRIEND_REQUEST_ACCEPTED',
          'CRIME_COOLDOWN_ENDED',
          'GYM_COOLDOWN_ENDED',
          'CONTRACT_EXECUTED',
          'CONTRACT_FULFILLED',
          'VIP_EXPIRED',
          'VIP_ACTIVATED',
          'OUT_OF_HOSPITAL',
          'OUT_OF_JAIL',
          'GANG_JOIN_REQUEST',
          'GANG_MEMBER_LEFT',
          'ASSASSINATED',
          'SYSTEM'
        ),
        allowNull: false
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      data: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      isRead: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Add indexes for better performance
    await queryInterface.addIndex('Notifications', ['userId']);
    await queryInterface.addIndex('Notifications', ['userId', 'isRead']);
    await queryInterface.addIndex('Notifications', ['createdAt']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Notifications');
  }
}; 