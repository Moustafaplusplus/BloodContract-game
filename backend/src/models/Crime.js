import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Crime = sequelize.define("crime", {
  name:        { type: DataTypes.STRING,  allowNull: false },
  slug:        { type: DataTypes.STRING,  allowNull: false, unique: true },
  isEnabled:   { type: DataTypes.BOOLEAN, defaultValue: true },

  req_level:   { type: DataTypes.INTEGER, defaultValue: 1 },
  req_intel:   { type: DataTypes.INTEGER, defaultValue: 1 },

  // Baseline energy cost now 5 instead of 10
  energyCost:  { type: DataTypes.INTEGER, defaultValue: 5 },

  successRate: { type: DataTypes.FLOAT,   defaultValue: 0.5 },
  minReward:   { type: DataTypes.INTEGER, defaultValue: 50 },
  maxReward:   { type: DataTypes.INTEGER, defaultValue: 150 },
  cooldown:    { type: DataTypes.INTEGER, defaultValue: 60 },

  failOutcome:     { type: DataTypes.ENUM("jail", "hospital", "both"), defaultValue: "both" },
  jailMinutes:     { type: DataTypes.INTEGER, defaultValue: 3 },
  hospitalMinutes: { type: DataTypes.INTEGER, defaultValue: 2 },
  hpLoss:          { type: DataTypes.INTEGER, defaultValue: 20 },

  bailRate:  { type: DataTypes.INTEGER, defaultValue: 50 },
  healRate:  { type: DataTypes.INTEGER, defaultValue: 40 },
});

export const CrimeLog = sequelize.define("CrimeLog", {
  userId:  DataTypes.INTEGER,
  crimeId: DataTypes.INTEGER,
  success: DataTypes.BOOLEAN,
  payout:  DataTypes.INTEGER,
  ts:      { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { timestamps: false }); 