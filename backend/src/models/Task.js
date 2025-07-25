import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export class Task extends Model {}

Task.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  metric: { type: DataTypes.STRING, allowNull: false }, // e.g., 'level', 'money', 'fights_won', etc.
  goal: { type: DataTypes.INTEGER, allowNull: false },
  rewardMoney: { type: DataTypes.INTEGER, defaultValue: 0 },
  rewardExp: { type: DataTypes.INTEGER, defaultValue: 0 },
  rewardBlackcoins: { type: DataTypes.INTEGER, defaultValue: 0 },
  progressPoints: { type: DataTypes.INTEGER, defaultValue: 0 },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  sequelize,
  modelName: 'Task',
  tableName: 'Tasks',
  timestamps: true
});

export class UserTaskProgress extends Model {}

UserTaskProgress.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  taskId: { type: DataTypes.INTEGER, allowNull: false },
  progress: { type: DataTypes.INTEGER, defaultValue: 0 },
  isCompleted: { type: DataTypes.BOOLEAN, defaultValue: false },
  rewardCollected: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  sequelize,
  modelName: 'UserTaskProgress',
  tableName: 'UserTaskProgresses',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['userId', 'taskId'] }
  ]
});

// Promotion System Models
export class Promotion extends Model {}

Promotion.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false }, // Arabic title
  titleEn: { type: DataTypes.STRING, allowNull: false }, // English title for reference
  rank: { type: DataTypes.INTEGER, allowNull: false, unique: true }, // 1-10
  requiredPoints: { type: DataTypes.INTEGER, allowNull: false }, // Progress points needed
  powerBonus: { type: DataTypes.INTEGER, defaultValue: 0 }, // Attack power bonus
  defenseBonus: { type: DataTypes.INTEGER, defaultValue: 0 }, // Defense bonus
  description: { type: DataTypes.TEXT, allowNull: false }, // Description of the rank
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  sequelize,
  modelName: 'Promotion',
  tableName: 'Promotions',
  timestamps: true
});

export class UserPromotion extends Model {}

UserPromotion.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  currentRank: { type: DataTypes.INTEGER, defaultValue: 0 }, // Current promotion rank (0-10)
  totalProgressPoints: { type: DataTypes.INTEGER, defaultValue: 0 }, // Total points collected
  lastPromotionDate: { type: DataTypes.DATE }, // When they last got promoted
}, {
  sequelize,
  modelName: 'UserPromotion',
  tableName: 'UserPromotions',
  timestamps: true
});

// Associations
Task.hasMany(UserTaskProgress, { foreignKey: 'taskId' });
UserTaskProgress.belongsTo(Task, { foreignKey: 'taskId' });

// Note: We'll handle promotion relationships in the service layer instead of model associations
// to avoid complex foreign key constraints that can cause issues 