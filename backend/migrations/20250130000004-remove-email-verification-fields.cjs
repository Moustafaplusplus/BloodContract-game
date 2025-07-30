'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Safely remove columns that might not exist
    const tableName = 'Users';
    const columns = [
      'emailVerified',
      'emailVerificationToken', 
      'emailVerificationExpires',
      'emailVerificationCode',
      'emailVerificationCodeExpires'
    ];

    for (const column of columns) {
      try {
        await queryInterface.removeColumn(tableName, column);
        console.log(`Removed column: ${column}`);
      } catch (error) {
        console.log(`Column ${column} does not exist, skipping...`);
      }
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'emailVerified', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });
    await queryInterface.addColumn('Users', 'emailVerificationToken', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Users', 'emailVerificationExpires', {
      type: Sequelize.DATE,
      allowNull: true
    });
    await queryInterface.addColumn('Users', 'emailVerificationCode', {
      type: Sequelize.STRING(6),
      allowNull: true
    });
    await queryInterface.addColumn('Users', 'emailVerificationCodeExpires', {
      type: Sequelize.DATE,
      allowNull: true
    });
  }
}; 