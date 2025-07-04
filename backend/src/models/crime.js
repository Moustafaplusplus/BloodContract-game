import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Crime = sequelize.define('crime', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  req_level: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  req_intel: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  energyCost: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
  },
  successRate: {
    type: DataTypes.FLOAT,
    defaultValue: 0.6,
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
    defaultValue: 60,
  },
});

export default Crime;