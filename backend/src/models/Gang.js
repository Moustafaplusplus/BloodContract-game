import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

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
  leaderId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  money: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  exp: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  maxMembers: {
    type: DataTypes.INTEGER,
    defaultValue: 10
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

export class GangWar extends Model {}

GangWar.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  gang1Id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  gang2Id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'FINISHED'),
    defaultValue: 'ACTIVE'
  },
  gang1Score: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  gang2Score: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  sequelize,
  modelName: 'GangWar',
  tableName: 'GangWars'
});

// Associations
Gang.hasMany(GangMember, { foreignKey: 'gangId' });
GangMember.belongsTo(Gang, { foreignKey: 'gangId' });

Gang.hasMany(GangWar, { as: 'Gang1Wars', foreignKey: 'gang1Id' });
Gang.hasMany(GangWar, { as: 'Gang2Wars', foreignKey: 'gang2Id' });
GangWar.belongsTo(Gang, { as: 'Gang1', foreignKey: 'gang1Id' });
GangWar.belongsTo(Gang, { as: 'Gang2', foreignKey: 'gang2Id' }); 