import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { Character } from './Character.js';
import { User } from './User.js';

export class Friendship extends Model {}

Friendship.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  requesterId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  addresseeId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'BLOCKED'),
    defaultValue: 'PENDING'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'Friendship',
  tableName: 'Friendships',
  timestamps: false
});

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
    type: DataTypes.ENUM('FRIEND_REQUEST', 'MESSAGE', 'ACHIEVEMENT', 'SYSTEM'),
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

// Associations
Friendship.belongsTo(Character, { as: 'Requester', foreignKey: 'requesterId', targetKey: 'id' });
Friendship.belongsTo(Character, { as: 'Addressee', foreignKey: 'addresseeId', targetKey: 'id' });

Message.belongsTo(Character, { as: 'Sender', foreignKey: 'senderId' });
Message.belongsTo(Character, { as: 'Receiver', foreignKey: 'receiverId' });

Notification.belongsTo(User, { foreignKey: 'userId' }); 