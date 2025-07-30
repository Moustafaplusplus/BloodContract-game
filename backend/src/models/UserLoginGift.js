import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export class UserLoginGift extends Model {}

UserLoginGift.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  currentStreak: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastClaimDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  claimedDays: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  isCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  sequelize,
  modelName: 'UserLoginGift',
  tableName: 'user_login_gifts',
  timestamps: true
}); 