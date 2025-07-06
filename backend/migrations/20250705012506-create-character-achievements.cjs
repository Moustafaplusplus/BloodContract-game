
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('characterAchievements', {
      characterId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'characters', key: 'id' } },
      achievementKey: { type: Sequelize.STRING, allowNull: false, references: { model: 'achievements', key: 'key' } },
      unlockedAt: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('characterAchievements');
  },
};
