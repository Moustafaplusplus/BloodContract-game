import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';
import User from './user.js';

class Character extends Model {}

Character.init(
  {
    energy: { type: DataTypes.INTEGER, defaultValue: 100 },
    money: { type: DataTypes.INTEGER, defaultValue: 0 },
    attackPower: { type: DataTypes.INTEGER, defaultValue: 10 },
    lastCrimeAt: { type: DataTypes.DATE, allowNull: true },
  },
  { sequelize, modelName: 'character' }
);

Character.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(Character, { foreignKey: 'userId' });

export default Character;
