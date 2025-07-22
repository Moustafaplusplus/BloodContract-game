import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export class MinistryMission extends Model {}

MinistryMission.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  missionId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  minLevel: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5
  },
  thumbnail: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  banner: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  missionData: {
    type: DataTypes.JSON,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  sequelize,
  modelName: 'MinistryMission',
  tableName: 'ministry_missions',
  timestamps: true
});

export class UserMinistryMission extends Model {}

UserMinistryMission.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  missionId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  ending: {
    type: DataTypes.STRING,
    allowNull: true
  },
  reward: {
    type: DataTypes.STRING,
    allowNull: true
  },
  expEarned: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  moneyEarned: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  blackcoinsEarned: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  sequelize,
  modelName: 'UserMinistryMission',
  tableName: 'user_ministry_missions',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'missionId']
    }
  ]
});

// Associations
MinistryMission.hasMany(UserMinistryMission, { foreignKey: 'missionId', sourceKey: 'missionId' });
UserMinistryMission.belongsTo(MinistryMission, { foreignKey: 'missionId', targetKey: 'missionId' }); 