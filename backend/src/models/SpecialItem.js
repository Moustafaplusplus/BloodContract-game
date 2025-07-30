import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export class SpecialItem extends Model {}
SpecialItem.init({
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
  type: {
    type: DataTypes.ENUM('HEALTH_POTION', 'ENERGY_POTION', 'EXPERIENCE_POTION', 'NAME_CHANGE', 'GANG_BOMB', 'ATTACK_IMMUNITY', 'CD_RESET', 'OTHER'),
    allowNull: false
  },
  effect: {
    type: DataTypes.JSON,
    allowNull: false
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  currency: {
    type: DataTypes.ENUM('money', 'blackcoin'),
    defaultValue: 'money'
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  levelRequired: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 1
  }
}, { 
  sequelize, 
  modelName: 'SpecialItem', 
  tableName: 'SpecialItems',
  timestamps: false 
}); 