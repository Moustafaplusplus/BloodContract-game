import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export class MoneyPackage extends Model {}

MoneyPackage.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  blackcoinCost: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  moneyAmount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  bonus: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'MoneyPackage',
  tableName: 'MoneyPackages',
  timestamps: true
}); 