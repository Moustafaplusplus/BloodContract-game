import { sequelize } from './src/config/db.js';
import { QueryTypes } from 'sequelize';

(async () => {
  try {
    // Check if gender column already exists
    const columns = await sequelize.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'gender'",
      { type: QueryTypes.SELECT }
    );

    if (columns.length === 0) {
      // Add gender column with default value
      await sequelize.query(
        "ALTER TABLE Users ADD COLUMN gender ENUM('male', 'female') NOT NULL DEFAULT 'male'",
        { type: QueryTypes.RAW }
      );
      console.log('✅ Gender column added successfully!');
    } else {
      console.log('✅ Gender column already exists!');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error adding gender column:', err);
    process.exit(1);
  }
})(); 