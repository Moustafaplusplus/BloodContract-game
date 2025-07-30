'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Update all characters' maxHp to match the getMaxHp() calculation
    // Formula: 1000 + ((level - 1) * 100)
    await queryInterface.sequelize.query(`
      UPDATE characters 
      SET "maxHp" = 1000 + ((level - 1) * 100)
      WHERE "maxHp" != (1000 + ((level - 1) * 100))
    `);
  },

  async down(queryInterface, Sequelize) {
    // This migration cannot be safely reversed
    // The original maxHp values are not preserved
  }
}; 