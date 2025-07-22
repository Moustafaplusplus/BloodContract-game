import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { User } from './User.js';

export class IpTracking extends Model {}

IpTracking.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isBlocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  blockReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  blockedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  lastSeen: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'IpTracking',
  tableName: 'IpTracking',
  timestamps: true,
  indexes: [
    {
      fields: ['ipAddress']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['isBlocked']
    }
  ]
});

// Associations
IpTracking.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(IpTracking, { foreignKey: 'userId' }); 