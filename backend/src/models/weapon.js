// backend/src/models/weapons.js
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';
import User from './user.js';

class Weapon extends Model {}

Weapon.init(
  {
    name: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.STRING }, // gun, knife, etc
    damage: { type: DataTypes.INTEGER, defaultValue: 5 },
    price: { type: DataTypes.INTEGER, defaultValue: 100 },
    description: { type: DataTypes.STRING },
  },
  {
    sequelize,
    modelName: 'weapon',
  }
);

class UserWeapon extends Model {}

UserWeapon.init(
  {
    userId: { type: DataTypes.INTEGER, allowNull: false },
    weaponId: { type: DataTypes.INTEGER, allowNull: false },
    isEquipped: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    sequelize,
    modelName: 'user_weapon',
  }
);

UserWeapon.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(UserWeapon, { foreignKey: 'userId' });
UserWeapon.belongsTo(Weapon, { foreignKey: 'weaponId' });
Weapon.hasMany(UserWeapon, { foreignKey: 'weaponId' });

export { Weapon, UserWeapon };
