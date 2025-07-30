import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export class LoginGift extends Model {}

LoginGift.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  dayNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 15
    }
  },
  expReward: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  moneyReward: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  blackcoinReward: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  sequelize,
  modelName: 'LoginGift',
  tableName: 'login_gifts',
  timestamps: true
}); 