'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop the existing foreign key constraint if it exists
    try {
      await queryInterface.removeConstraint('Statistics', 'Statistics_userId_fkey');
    } catch (error) {
      // Constraint might not exist, ignore error
      console.log('Foreign key constraint Statistics_userId_fkey does not exist, skipping removal');
    }

    // Add the correct foreign key constraint to reference users table
    await queryInterface.addConstraint('Statistics', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'Statistics_userId_fkey',
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the foreign key constraint
    try {
      await queryInterface.removeConstraint('Statistics', 'Statistics_userId_fkey');
    } catch (error) {
      console.log('Foreign key constraint Statistics_userId_fkey does not exist, skipping removal');
    }

    // Add back the old constraint (if needed for rollback)
    // Note: This would recreate the problematic constraint, so we'll leave it commented
    // await queryInterface.addConstraint('Statistics', {
    //   fields: ['userId'],
    //   type: 'foreign key',
    //   name: 'Statistics_userId_fkey',
    //   references: {
    //     table: 'characters',
    //     field: 'userId'
    // },
    //   onDelete: 'CASCADE',
    //   onUpdate: 'CASCADE'
    // });
  }
}; 