// hospital.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Hospital = sequelize.define(
  'Hospital',
  {
    userId:   { type: DataTypes.INTEGER, unique: true },
    hpLost:   DataTypes.INTEGER,
    minutes:  DataTypes.INTEGER,
    startedAt:{ type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { timestamps: false },
);

export default Hospital;
