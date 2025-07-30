// Migration: Add 'LEVEL_UP' to enum_Notifications_type

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add 'LEVEL_UP' to the enum type for Notifications.type
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'enum_Notifications_type' AND e.enumlabel = 'LEVEL_UP') THEN
          ALTER TYPE "enum_Notifications_type" ADD VALUE 'LEVEL_UP';
        END IF;
      END$$;
    `);
  },
  down: async (queryInterface, Sequelize) => {
    // Postgres does not support removing enum values easily, so this is a no-op
  }
}; 