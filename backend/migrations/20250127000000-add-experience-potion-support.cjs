'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add levelRequired column
    await queryInterface.addColumn('SpecialItems', 'levelRequired', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 1
    });

    // Update the type enum to include EXPERIENCE_POTION
    // Note: This is a simplified approach. In production, you might need to handle this differently
    // depending on your database system
    try {
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_SpecialItems_type" ADD VALUE 'EXPERIENCE_POTION';
      `);
    } catch (error) {
      // If the enum value already exists, ignore the error
      console.log('EXPERIENCE_POTION enum value might already exist:', error.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove levelRequired column
    await queryInterface.removeColumn('SpecialItems', 'levelRequired');

    // Note: Removing enum values is complex and depends on the database system
    // This is a simplified rollback
    console.log('Note: EXPERIENCE_POTION enum value removal requires manual intervention');
  }
}; 