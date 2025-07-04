import { DataTypes, Model } from 'sequelize';
import { sequelize }        from '../config/db.js';

import User   from './user.js';
import Weapon from './weapon.js';
import Armor  from './armor.js';

class Character extends Model {}

Character.init(
  {
    /* core resources */
    energy:  { type: DataTypes.INTEGER, defaultValue: 100 }, // الطاقة
    money:   { type: DataTypes.INTEGER, defaultValue: 0 },   // المال
    hp:      { type: DataTypes.INTEGER, defaultValue: 100 }, // الصحة

    /* combat stats */
    str:          { type: DataTypes.INTEGER, defaultValue: 10 }, // القوة
    dex:          { type: DataTypes.INTEGER, defaultValue: 5  }, // الرشاقة
    defense:      { type: DataTypes.INTEGER, defaultValue: 5  }, // الدفاع
    stamina:      { type: DataTypes.INTEGER, defaultValue: 100 },// اللياقة

    /* progression */
    xp:    { type: DataTypes.INTEGER, defaultValue: 0 },
    level: { type: DataTypes.INTEGER, defaultValue: 1 },

    lastCrimeAt: { type: DataTypes.DATE, allowNull: true },

    /* equipped items (FKs) */
    equippedWeaponId: { type: DataTypes.INTEGER, allowNull: true },
    equippedArmorId:  { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    sequelize,
    modelName: 'character',
  },
);

/* ---- instance helpers ---- */
Character.prototype.addXp = async function (amount) {
  this.xp += amount;
  const xpNeeded = this.level * 100;
  if (this.xp >= xpNeeded) {
    this.level += 1;
    this.xp -= xpNeeded;
  }
  await this.save();
};

/* ---- associations ---- */
Character.belongsTo(User,   { foreignKey: 'userId' });
User.hasOne(Character,      { foreignKey: 'userId' });

Character.belongsTo(Weapon, { foreignKey: 'equippedWeaponId', as: 'equippedWeapon' });
Character.belongsTo(Armor,  { foreignKey: 'equippedArmorId',  as: 'equippedArmor' });

export default Character;
