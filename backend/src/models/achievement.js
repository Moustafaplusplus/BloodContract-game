
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

class Achievement extends Model {}

Achievement.init(
  {
    key: { type: DataTypes.STRING, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: false },
    xpReward: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  { sequelize, modelName: 'Achievement' },
);

export default Achievement;
