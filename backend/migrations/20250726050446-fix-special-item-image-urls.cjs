'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Update existing special items to fix image URLs
    await queryInterface.sequelize.query(`
      UPDATE "SpecialItems" 
      SET "imageUrl" = REPLACE("imageUrl", '/public/special-items/', '/special-items/')
      WHERE "imageUrl" LIKE '/public/special-items/%'
    `);
  },

  async down(queryInterface, Sequelize) {
    // Revert the changes if needed
    await queryInterface.sequelize.query(`
      UPDATE "SpecialItems" 
      SET "imageUrl" = REPLACE("imageUrl", '/special-items/', '/public/special-items/')
      WHERE "imageUrl" LIKE '/special-items/%'
    `);
  }
};
