import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Statistic = sequelize.define('Statistic', {
  userId:     { type: DataTypes.INTEGER, allowNull: false, unique: true },
  crimes:     { type: DataTypes.INTEGER, defaultValue: 0 },
  fights:     { type: DataTypes.INTEGER, defaultValue: 0 },
  wins:       { type: DataTypes.INTEGER, defaultValue: 0 },
  losses:     { type: DataTypes.INTEGER, defaultValue: 0 },
  daysOnline: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  timestamps: true,
  tableName: 'Statistics',
});
// NOTE: You must run a migration or SQL to add 'wins' and 'losses' columns to the Statistics table in your database. 