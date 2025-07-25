import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { User } from './User.js';

export class GlobalMessage extends Model {}

GlobalMessage.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  messageType: {
    type: DataTypes.ENUM('GLOBAL', 'SYSTEM', 'ANNOUNCEMENT'),
    defaultValue: 'GLOBAL'
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
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'GlobalMessage',
  tableName: 'GlobalMessages',
  timestamps: false
});

GlobalMessage.belongsTo(User, { foreignKey: 'userId' }); 