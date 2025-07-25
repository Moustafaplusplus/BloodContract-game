import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const JobDefinition = sequelize.define('job_definition', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  tier: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  minLevel: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  salary: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 50
  },
  expPerDay: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10
  },
  isEnabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'job_definitions',
  timestamps: true
}); 