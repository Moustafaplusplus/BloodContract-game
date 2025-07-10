'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('characters', 'title', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('characters', 'equippedHouseId', { type: Sequelize.INTEGER, allowNull: true });
    await queryInterface.addColumn('characters', 'gangId', { type: Sequelize.INTEGER, allowNull: true });
    await queryInterface.addColumn('characters', 'daysInGame', { type: Sequelize.INTEGER, defaultValue: 0 });
    await queryInterface.addColumn('characters', 'avatarUrl', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('characters', 'killCount', { type: Sequelize.INTEGER, defaultValue: 0 });
    await queryInterface.addColumn('characters', 'lastActive', { type: Sequelize.DATE, allowNull: true });
    await queryInterface.addColumn('characters', 'buffs', { type: Sequelize.JSON, defaultValue: {} });
    await queryInterface.addColumn('characters', 'quote', { type: Sequelize.STRING, allowNull: true });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('characters', 'title');
    await queryInterface.removeColumn('characters', 'equippedHouseId');
    await queryInterface.removeColumn('characters', 'gangId');
    await queryInterface.removeColumn('characters', 'daysInGame');
    await queryInterface.removeColumn('characters', 'avatarUrl');
    await queryInterface.removeColumn('characters', 'killCount');
    await queryInterface.removeColumn('characters', 'lastActive');
    await queryInterface.removeColumn('characters', 'buffs');
    await queryInterface.removeColumn('characters', 'quote');
  }
};
