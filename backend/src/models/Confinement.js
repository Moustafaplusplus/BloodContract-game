import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Jail = sequelize.define("Jail", {
  userId:     { type: DataTypes.INTEGER, allowNull: false },
  minutes:    { type: DataTypes.INTEGER, allowNull: false },
  bailRate:   { type: DataTypes.INTEGER, allowNull: false, defaultValue: 5 }, // $ per min
  startedAt:  { type: DataTypes.DATE,    allowNull: false, defaultValue: DataTypes.NOW },
  releasedAt: { type: DataTypes.DATE,    allowNull: false },
  crimeId:    { type: DataTypes.INTEGER, allowNull: true },
}, { tableName: "Jails", timestamps: false });

export const Hospital = sequelize.define("Hospital", {
  userId:     { type: DataTypes.INTEGER, allowNull: false },
  minutes:    { type: DataTypes.INTEGER, allowNull: false },
  hpLoss:     { type: DataTypes.INTEGER, allowNull: false, field: "hpLost" },
  healRate:   { type: DataTypes.INTEGER, allowNull: false, defaultValue: 3 },
  startedAt:  { type: DataTypes.DATE,    allowNull: false, defaultValue: DataTypes.NOW },
  releasedAt: { type: DataTypes.DATE,    allowNull: false, field: "releaseAt" },
  crimeId:    { type: DataTypes.INTEGER, allowNull: true },
}, { tableName: "Hospitals", timestamps: false }); 