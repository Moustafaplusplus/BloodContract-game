import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { User } from './User.js';

export class Notification extends Model {}

Notification.init({
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
    type: DataTypes.ENUM(
      'ATTACKED',
      'HOSPITALIZED', 
      'JAILED',
      'BANK_INTEREST',
      'JOB_SALARY',
      'BLACK_MARKET_SOLD',
      'MESSAGE_RECEIVED',
      'FRIEND_REQUEST_RECEIVED',
      'FRIEND_REQUEST_ACCEPTED',
      'CRIME_COOLDOWN_ENDED',
      'GYM_COOLDOWN_ENDED',
      'CONTRACT_EXECUTED',
      'CONTRACT_FULFILLED',
      'VIP_EXPIRED',
      'VIP_ACTIVATED',
      'OUT_OF_HOSPITAL',
      'OUT_OF_JAIL',
      'GANG_JOIN_REQUEST',
      'GANG_MEMBER_LEFT',
      'ASSASSINATED',
      'GHOST_ASSASSINATED',
      'CONTRACT_ATTEMPTED',
      'CONTRACT_EXPIRED',
      'CONTRACT_TARGET_ASSASSINATED',
      'CD_RESET_ACTIVATED',
      'SYSTEM',
      'GAME_NEWS'
    ),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  data: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'Notification',
  tableName: 'Notifications',
  timestamps: false
});

Notification.belongsTo(User, { foreignKey: 'userId' });
