'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if the table exists first
    const tableExists = await queryInterface.showAllTables().then(tables => 
      tables.includes('Notifications')
    );
    
    if (!tableExists) {
      console.log('Notifications table does not exist, skipping enum update');
      return;
    }

    // Check if the enum type exists
    try {
      await queryInterface.sequelize.query(`
        SELECT 1 FROM pg_type WHERE typname = 'enum_Notifications_type';
      `);
    } catch (error) {
      console.log('Enum type does not exist, skipping update');
      return;
    }

    // Drop the existing enum type and recreate it with new values
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_Notifications_type" RENAME TO "enum_Notifications_type_old";
    `);

    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_Notifications_type" AS ENUM (
        'ATTACKED',
        'HOSPITALIZED', 
        'JAILED',
        'BANK_INTEREST',
        'JOB_SALARY',
        'BLACK_MARKET_SOLD',
        'MESSAGE_RECEIVED',
        'FRIEND_REQUEST_RECEIVED',
        'FRIEND_REQUEST_ACCEPTED',
        'CRIME_COOLDOWN_ENDED',
        'GYM_COOLDOWN_ENDED',
        'CONTRACT_EXECUTED',
        'CONTRACT_FULFILLED',
        'VIP_EXPIRED',
        'VIP_ACTIVATED',
        'OUT_OF_HOSPITAL',
        'OUT_OF_JAIL',
        'GANG_JOIN_REQUEST',
        'GANG_MEMBER_LEFT',
        'ASSASSINATED',
        'SYSTEM'
      );
    `);

    // Update the column to use the new enum type
    await queryInterface.sequelize.query(`
      ALTER TABLE "Notifications" 
      ALTER COLUMN "type" TYPE "enum_Notifications_type" 
      USING "type"::text::"enum_Notifications_type";
    `);

    // Drop the old enum type
    await queryInterface.sequelize.query(`
      DROP TYPE "enum_Notifications_type_old";
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Check if the table exists first
    const tableExists = await queryInterface.showAllTables().then(tables => 
      tables.includes('Notifications')
    );
    
    if (!tableExists) {
      return;
    }

    // Revert to the old enum type
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_Notifications_type" RENAME TO "enum_Notifications_type_new";
    `);

    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_Notifications_type" AS ENUM (
        'FRIEND_REQUEST',
        'MESSAGE',
        'ACHIEVEMENT',
        'SYSTEM'
      );
    `);

    // Update the column to use the old enum type
    await queryInterface.sequelize.query(`
      ALTER TABLE "Notifications" 
      ALTER COLUMN "type" TYPE "enum_Notifications_type" 
      USING "type"::text::"enum_Notifications_type";
    `);

    // Drop the new enum type
    await queryInterface.sequelize.query(`
      DROP TYPE "enum_Notifications_type_new";
    `);
  }
}; 