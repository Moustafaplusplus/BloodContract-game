import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { Weapon, Armor } from './Shop.js';

export const Character = sequelize.define('character', {
  userId:    { type: DataTypes.INTEGER, allowNull: false, unique: true },
  name:      { type: DataTypes.STRING,  allowNull: false },
  level:     { type: DataTypes.INTEGER, defaultValue: 1 },
  exp:       { type: DataTypes.INTEGER, defaultValue: 0 },

  money:     { type: DataTypes.INTEGER, defaultValue: 1500 },
  strength:  { type: DataTypes.INTEGER, defaultValue: 10 },
  defense:   { type: DataTypes.INTEGER, defaultValue: 5 },

  maxEnergy: { type: DataTypes.INTEGER, defaultValue: 100 },
  energy:    { type: DataTypes.INTEGER, defaultValue: 100 },
  maxHp:     { type: DataTypes.INTEGER, defaultValue: 100 },
  hp:        { type: DataTypes.INTEGER, defaultValue: 100 },

  equippedWeaponId: { type: DataTypes.INTEGER, allowNull: true },
  equippedArmorId:  { type: DataTypes.INTEGER, allowNull: true },
  equippedCarId:    { type: DataTypes.INTEGER, allowNull: true },

  crimeCooldown: { type: DataTypes.BIGINT, defaultValue: 0 },
  title: { type: DataTypes.STRING, allowNull: true },
  equippedHouseId: { type: DataTypes.INTEGER, allowNull: true },
  gangId: { type: DataTypes.INTEGER, allowNull: true },
  daysInGame: { type: DataTypes.INTEGER, defaultValue: 0 },
  avatarUrl: { type: DataTypes.STRING, allowNull: true },
  killCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  lastActive: { type: DataTypes.DATE, allowNull: true },
  buffs: { type: DataTypes.JSON, defaultValue: {} },
  quote: { type: DataTypes.STRING, allowNull: true },
});

// Instance method for safe JSON with equipment bonuses
Character.prototype.toSafeJSON = async function () {
  const [weapon, armor] = await Promise.all([
    this.equippedWeaponId ? Weapon.findByPk(this.equippedWeaponId) : null,
    this.equippedArmorId  ? Armor.findByPk(this.equippedArmorId)   : null,
  ]);

  const bonusStr = weapon?.damage      ?? 0;
  const bonusEng = weapon?.energyBonus ?? 0;
  const bonusDef = armor ?.def         ?? 0;
  const bonusHp  = armor ?.hpBonus     ?? 0;

  // User fields if loaded
  const user = this.User || {};

  return {
    id:           this.id,
    name:         this.name,
    nickname:     user.nickname,
    username:     user.username,
    email:        user.email,
    avatarUrl:    user.avatarUrl || this.avatarUrl,
    level:        this.level,
    money:        this.money,
    exp:          this.exp,
    nextLevelExp: this.expNeeded(),
    energy:       this.energy,
    hp:           this.hp,
    maxEnergy:    this.maxEnergy + bonusEng,
    maxHp:        this.maxHp     + bonusHp,
    strength:     this.strength + bonusStr,
    defense:      this.defense  + bonusDef,
    title:        this.title,
    equippedHouseId: this.equippedHouseId,
    gangId:       this.gangId,
    daysInGame:   this.daysInGame,
    killCount:    this.killCount,
    lastActive:   this.lastActive,
    buffs:        this.buffs,
    quote:        this.quote,
  };
};

// Instance method for EXP calculation
Character.prototype.expNeeded = function() {
  return Math.floor(100 * Math.pow(1.15, this.level - 1));
}; 