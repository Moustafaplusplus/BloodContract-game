'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const loginGifts = [];
    
    // Create 15 days of login gifts with default values
    for (let day = 1; day <= 15; day++) {
      loginGifts.push({
        dayNumber: day,
        expReward: 0,
        moneyReward: 0,
        blackcoinReward: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    await queryInterface.bulkInsert('login_gifts', loginGifts, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('login_gifts', null, {});
  }
}; 