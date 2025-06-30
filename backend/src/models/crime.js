import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Crime = sequelize.define('crime', {
  // Column definitions
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  energyCost: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
  },
  successRate: {
    type: DataTypes.FLOAT,
    defaultValue: 0.6, // 60 %
  },
  minReward: {
    type: DataTypes.INTEGER,
    defaultValue: 50,
  },
  maxReward: {
    type: DataTypes.INTEGER,
    defaultValue: 150,
  },
  cooldown: {
    type: DataTypes.INTEGER,
    defaultValue: 60, // seconds
  },
});
