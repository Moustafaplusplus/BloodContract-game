import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';
import User from './user.js';

class Character extends Model {}

Character.init(
  {
    energy: { type: DataTypes.INTEGER, defaultValue: 100 },        // الطاقة
    money: { type: DataTypes.INTEGER, defaultValue: 0 },           // المال
    attackPower: { type: DataTypes.INTEGER, defaultValue: 10 },    // القوة الهجومية
    defense: { type: DataTypes.INTEGER, defaultValue: 5 },         // الدفاع
    stamina: { type: DataTypes.INTEGER, defaultValue: 100 },       // اللياقة
    hp: { type: DataTypes.INTEGER, defaultValue: 100 },            // الصحة
    lastCrimeAt: { type: DataTypes.DATE, allowNull: true },
    xp: { type: DataTypes.INTEGER, defaultValue: 0 },              // الخبرة
    level: { type: DataTypes.INTEGER, defaultValue: 1 },           // المستوى
  },
  {
    sequelize,
    modelName: 'character',
  }
);

Character.prototype.addXp = async function (amount) {
  this.xp += amount;
  const xpForNextLevel = this.level * 100;
  if (this.xp >= xpForNextLevel) {
    this.level += 1;
    this.xp -= xpForNextLevel;
  }
  await this.save();
};

Character.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(Character, { foreignKey: 'userId' });

export default Character;
