'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if the fights table exists
    const tableExists = await queryInterface.showAllTables().then(tables => 
      tables.includes('fights')
    );
    
    if (!tableExists) {
      console.log('Fights table does not exist, skipping column rename');
      return;
    }
    
    // Check if the damage_given column exists
    const columns = await queryInterface.describeTable('fights');
    if (!columns.damage_given) {
      console.log('damage_given column does not exist, skipping rename');
      return;
    }
    
    // Rename damage_given column to total_damage for better clarity
    await queryInterface.renameColumn('fights', 'damage_given', 'total_damage');
  },

  async down(queryInterface, Sequelize) {
    // Check if the fights table exists
    const tableExists = await queryInterface.showAllTables().then(tables => 
      tables.includes('fights')
    );
    
    if (!tableExists) {
      console.log('Fights table does not exist, skipping column revert');
      return;
    }
    
    // Check if the total_damage column exists
    const columns = await queryInterface.describeTable('fights');
    if (!columns.total_damage) {
      console.log('total_damage column does not exist, skipping revert');
      return;
    }
    
    // Revert the column name back to damage_given
    await queryInterface.renameColumn('fights', 'total_damage', 'damage_given');
  }
}; 