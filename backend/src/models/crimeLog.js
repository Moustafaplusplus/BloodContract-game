// crimeLog.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const CrimeLog = sequelize.define(
  'CrimeLog',
  {
    userId:  DataTypes.INTEGER,
    crimeId: DataTypes.INTEGER,
    success: DataTypes.BOOLEAN,
    payout:  DataTypes.INTEGER,
    ts:      { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { timestamps: false },
);

export default CrimeLog;
