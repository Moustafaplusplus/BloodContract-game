// backend/src/models/crime.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Crime = sequelize.define(
  'crime',
  {
    name:        { type: DataTypes.STRING,  allowNull: false },
    slug:        { type: DataTypes.STRING,  allowNull: false, unique: true },
    isEnabled:   { type: DataTypes.BOOLEAN, defaultValue: true },

    /* requirements & costs */
    req_level:   { type: DataTypes.INTEGER, defaultValue: 1 },
    req_intel:   { type: DataTypes.INTEGER, defaultValue: 1 },
    energyCost:  { type: DataTypes.INTEGER, defaultValue: 10 },

    /* balance knobs */
    successRate: { type: DataTypes.FLOAT,   defaultValue: 0.5 }, // 0-1
    minReward:   { type: DataTypes.INTEGER, defaultValue: 50 },
    maxReward:   { type: DataTypes.INTEGER, defaultValue: 150 },
    cooldown:    { type: DataTypes.INTEGER, defaultValue: 60 },  // sec

    /* failure handling */
    failOutcome:     { type: DataTypes.ENUM('jail', 'hospital', 'both'), defaultValue: 'both' },
    jailMinutes:     { type: DataTypes.INTEGER, defaultValue: 3 },
    hospitalMinutes: { type: DataTypes.INTEGER, defaultValue: 2 },
    hpLoss:          { type: DataTypes.INTEGER, defaultValue: 20 },

    /* economy */
    bailRate: { type: DataTypes.INTEGER, defaultValue: 50 },
    healRate: { type: DataTypes.INTEGER, defaultValue: 40 },
  },
  { underscored: false }
);

export default Crime;
