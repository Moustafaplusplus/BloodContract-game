'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Check if imageUrl column exists, if not add it
    try {
      await queryInterface.addColumn('Houses', 'imageUrl', {
        type: Sequelize.STRING,
        allowNull: true
      });
    } catch (error) {
      console.log('imageUrl column might already exist:', error.message);
    }
    
    // Check if rarity column exists, if not add it
    try {
      await queryInterface.addColumn('Houses', 'rarity', {
        type: Sequelize.STRING,
        defaultValue: 'COMMON'
      });
    } catch (error) {
      console.log('rarity column might already exist:', error.message);
    }
  },

  async down (queryInterface, Sequelize) {
    try {
      await queryInterface.removeColumn('Houses', 'imageUrl');
    } catch (error) {
      console.log('Could not remove imageUrl column:', error.message);
    }
    
    try {
      await queryInterface.removeColumn('Houses', 'rarity');
    } catch (error) {
      console.log('Could not remove rarity column:', error.message);
    }
  }
};
