import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export class Achievement extends Model {}

Achievement.init({
  key: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  xpReward: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING,
    defaultValue: 'GENERAL'
  }
}, {
  sequelize,
  modelName: 'Achievement',
  tableName: 'Achievements',
  timestamps: false
});

export class CharacterAchievement extends Model {}

CharacterAchievement.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  characterId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  achievementKey: {
    type: DataTypes.STRING,
    allowNull: false
  },
  unlockedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'CharacterAchievement',
  tableName: 'CharacterAchievements',
  timestamps: false
});

// Associations
Achievement.hasMany(CharacterAchievement, { foreignKey: 'achievementKey' });
CharacterAchievement.belongsTo(Achievement, { foreignKey: 'achievementKey' }); 