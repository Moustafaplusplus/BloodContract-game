import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { Character } from './Character.js';

export class Message extends Model {}

Message.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  receiverId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  reactions: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {}
  },
  edited: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  editedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  },
  deleted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
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
  modelName: 'Message',
  tableName: 'Messages',
  timestamps: false
});

Message.belongsTo(Character, { as: 'Sender', foreignKey: 'senderId' });
Message.belongsTo(Character, { as: 'Receiver', foreignKey: 'receiverId' });