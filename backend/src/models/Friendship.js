// ...existing code...
import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
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

Friendship.belongsTo(User, { as: 'Requester', foreignKey: 'requesterId', targetKey: 'id' });
Friendship.belongsTo(User, { as: 'Addressee', foreignKey: 'addresseeId', targetKey: 'id' });