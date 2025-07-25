'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Tasks', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      title: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: false },
      metric: { type: Sequelize.STRING, allowNull: false },
      goal: { type: Sequelize.INTEGER, allowNull: false },
      rewardMoney: { type: Sequelize.INTEGER, defaultValue: 0 },
      rewardExp: { type: Sequelize.INTEGER, defaultValue: 0 },
      rewardBlackcoins: { type: Sequelize.INTEGER, defaultValue: 0 },
      progressPoints: { type: Sequelize.INTEGER, defaultValue: 0 },
      isActive: { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });
    await queryInterface.createTable('UserTaskProgresses', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      userId: { type: Sequelize.INTEGER, allowNull: false },
      taskId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Tasks', key: 'id' }, onDelete: 'CASCADE' },
      progress: { type: Sequelize.INTEGER, defaultValue: 0 },
      isCompleted: { type: Sequelize.BOOLEAN, defaultValue: false },
      rewardCollected: { type: Sequelize.BOOLEAN, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });
    await queryInterface.addIndex('UserTaskProgresses', ['userId', 'taskId'], { unique: true });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('UserTaskProgresses');
    await queryInterface.dropTable('Tasks');
  }
};
