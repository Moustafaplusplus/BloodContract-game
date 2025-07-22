import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { User } from './User.js';
import { Character } from './Character.js';

export class Gang extends Model {}

Gang.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  board: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },

  leaderId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  money: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  maxMembers: {
    type: DataTypes.INTEGER,
    defaultValue: 30
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'Gang',
  tableName: 'Gangs'
});

export class GangMember extends Model {}

GangMember.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  gangId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('LEADER', 'OFFICER', 'MEMBER'),
    defaultValue: 'MEMBER'
  },
  joinedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'GangMember',
  tableName: 'GangMembers'
});

export class GangJoinRequest extends Model {}

GangJoinRequest.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  gangId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'ACCEPTED', 'REJECTED'),
    defaultValue: 'PENDING'
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true
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
  modelName: 'GangJoinRequest',
  tableName: 'GangJoinRequests'
});



// Associations
Gang.hasMany(GangMember, { foreignKey: 'gangId' });
GangMember.belongsTo(Gang, { foreignKey: 'gangId' });

GangMember.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(GangMember, { foreignKey: 'userId' });

// Ensure User-Character association is available
User.hasOne(Character, { foreignKey: 'userId' });
Character.belongsTo(User, { foreignKey: 'userId' });

// Gang Join Request associations
Gang.hasMany(GangJoinRequest, { foreignKey: 'gangId' });
GangJoinRequest.belongsTo(Gang, { foreignKey: 'gangId' });
GangJoinRequest.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(GangJoinRequest, { foreignKey: 'userId' });

 