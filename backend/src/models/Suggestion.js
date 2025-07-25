import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export class Suggestion extends Model {}

Suggestion.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('suggestion', 'bug', 'other'),
    allowNull: false,
    defaultValue: 'suggestion'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('unread', 'pending', 'done'),
    allowNull: false,
    defaultValue: 'unread'
  },
  adminNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  resolvedBy: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Suggestion',
  tableName: 'Suggestions',
  timestamps: true
}); 