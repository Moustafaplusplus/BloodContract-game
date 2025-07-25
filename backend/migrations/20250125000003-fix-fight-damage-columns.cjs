'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Change damage_given column from FLOAT to INTEGER
    await queryInterface.changeColumn('fights', 'damage_given', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });

    // Change attacker_damage column from FLOAT to INTEGER
    await queryInterface.changeColumn('fights', 'attacker_damage', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });

    // Change defender_damage column from FLOAT to INTEGER
    await queryInterface.changeColumn('fights', 'defender_damage', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert damage_given column back to FLOAT
    await queryInterface.changeColumn('fights', 'damage_given', {
      type: Sequelize.FLOAT,
      allowNull: false
    });

    // Revert attacker_damage column back to FLOAT
    await queryInterface.changeColumn('fights', 'attacker_damage', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0
    });

    // Revert defender_damage column back to FLOAT
    await queryInterface.changeColumn('fights', 'defender_damage', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0
    });
  }
}; 