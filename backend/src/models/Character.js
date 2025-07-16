import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { Weapon, Armor } from './Shop.js';
import { Fight } from './Fight.js';
import { Statistic } from './Statistic.js'; // <-- Add this import
import { Op } from 'sequelize';

export class Character extends Model {}

Character.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  name: { type: DataTypes.STRING, allowNull: false },
  level: { type: DataTypes.INTEGER, defaultValue: 1 },
  exp: { type: DataTypes.INTEGER, defaultValue: 0 },

  money: { type: DataTypes.INTEGER, defaultValue: 1500 },
  strength: { type: DataTypes.INTEGER, defaultValue: 10 },
  defense: { type: DataTypes.INTEGER, defaultValue: 5 },

  maxEnergy: { type: DataTypes.INTEGER, defaultValue: 100 },
  energy: { type: DataTypes.INTEGER, defaultValue: 100 },
  maxHp: { type: DataTypes.INTEGER, defaultValue: 1000 },
  hp: { type: DataTypes.INTEGER, defaultValue: 1000 },

  equippedWeapon1Id: { type: DataTypes.INTEGER, allowNull: true },
  equippedWeapon2Id: { type: DataTypes.INTEGER, allowNull: true },
  equippedArmorId: { type: DataTypes.INTEGER, allowNull: true },

  crimeCooldown: { type: DataTypes.BIGINT, defaultValue: 0 },
  gymCooldown: { type: DataTypes.BIGINT, defaultValue: 0 },
  equippedHouseId: { type: DataTypes.INTEGER, allowNull: true },
  gangId: { type: DataTypes.INTEGER, allowNull: true },
  daysInGame: { type: DataTypes.INTEGER, defaultValue: 0 },
  avatarUrl: { type: DataTypes.STRING, allowNull: true },
  killCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  lastActive: { type: DataTypes.DATE, allowNull: true },
  buffs: { type: DataTypes.JSON, defaultValue: {} },
  quote: { type: DataTypes.STRING, allowNull: true },
  blackcoins: { type: DataTypes.INTEGER, defaultValue: 0 },
  vipExpiresAt: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
}, {
  sequelize,
  modelName: 'Character',
  tableName: 'characters',
  timestamps: true
});

// Add a getter for maxHp based on level
Character.prototype.getMaxHp = function() {
  return 1000 + (this.level * 100);
};

// Instance method for safe JSON with equipment bonuses
Character.prototype.toSafeJSON = async function () {
  // Eager load equipped house if not already loaded
  let equippedHouse = this.equippedHouse;
  if (!equippedHouse && this.equippedHouseId) {
    const { House } = await import('./House.js');
    equippedHouse = await House.findByPk(this.equippedHouseId);
  }

  // Fetch active dog
  let activeDog = null;
  try {
    const { UserDog, Dog } = await import('./Dog.js');
    const userDog = await UserDog.findOne({
      where: { userId: this.userId, isActive: true },
      include: [Dog]
    });
    if (userDog && userDog.Dog) activeDog = userDog.Dog;
  } catch (e) { /* ignore if Dog model not present */ }

  const [weapon1, weapon2, armor, fightsLost, stats, fightsWon, fightsTotal] = await Promise.all([
    this.equippedWeapon1Id ? Weapon.findByPk(this.equippedWeapon1Id) : null,
    this.equippedWeapon2Id ? Weapon.findByPk(this.equippedWeapon2Id) : null,
    this.equippedArmorId  ? Armor.findByPk(this.equippedArmorId)   : null,
    Fight.count({
      where: {
        [Op.or]: [
          { attacker_id: this.userId },
          { defender_id: this.userId }
        ],
        winner_id: { [Op.ne]: this.userId }
      }
    }),
    Statistic.findOne({ where: { userId: this.userId } }),
    Fight.count({
      where: {
        winner_id: this.userId
      }
    }),
    Fight.count({
      where: {
        [Op.or]: [
          { attacker_id: this.userId },
          { defender_id: this.userId }
        ]
      }
    })
  ]);

  // Calculate total bonuses from both weapons
  const bonusStr1 = weapon1?.damage      ?? 0;
  const bonusEng1 = weapon1?.energyBonus ?? 0;
  const bonusStr2 = weapon2?.damage      ?? 0;
  const bonusEng2 = weapon2?.energyBonus ?? 0;
  
  const totalBonusStr = bonusStr1 + bonusStr2;
  const totalBonusEng = bonusEng1 + bonusEng2;
  
  const bonusDef = (armor?.def ?? 0) + (equippedHouse?.defenseBonus ?? 0);
  const bonusHp  = (armor?.hpBonus ?? 0) + (equippedHouse?.hpBonus ?? 0);
  const dogPower = activeDog?.powerBonus ?? 0;

  // User fields if loaded
  const user = this.User || {};

  // Calculate total fights
  const crimesCommitted = stats?.crimes || 0;
  const fightsWonCount = stats?.wins ?? fightsWon ?? 0;
  const fightsLostCount = stats?.losses ?? fightsLost ?? 0;
  const fightsTotalCount = fightsWonCount + fightsLostCount;
  // Use the accurate fightsTotal from above

  return {
    userId:        this.userId,
    name:         this.name,
    username:     user.username,
    avatarUrl:    user.avatarUrl || this.avatarUrl,
    level:        this.level,
    money:        this.money,
    blackcoins:   this.blackcoins,
    exp:          this.exp,
    nextLevelExp: this.expNeeded(),
    energy:       this.energy,
    hp:           this.hp,
    maxEnergy:    this.maxEnergy + totalBonusEng,
    maxHp:        this.getMaxHp()     + bonusHp,
    strength:     this.strength + totalBonusStr + dogPower,
    defense:      this.defense  + bonusDef,
    equippedHouseId: this.equippedHouseId,
    gangId:       this.gangId,
    daysInGame: this.createdAt ? Math.max(1, Math.ceil((Date.now() - new Date(this.createdAt).getTime()) / (1000 * 60 * 60 * 24))) : 1,
    killCount:    this.killCount,
    lastActive:   this.lastActive,
    buffs:        this.buffs,
    quote:        this.quote,
    fightsLost:   fightsLostCount,
    crimesCommitted: crimesCommitted,
    fightsWon: fightsWonCount,
    fightsTotal: fightsTotalCount,
    // Equipment info for frontend
    equippedWeapon1: weapon1,
    equippedWeapon2: weapon2,
    equippedArmor:   armor,
    equippedHouse:   equippedHouse,
    activeDog:       activeDog,
    vipExpiresAt:    this.vipExpiresAt,
  };
};

// Instance method for EXP calculation
Character.prototype.expNeeded = function() {
  return Math.floor(100 * Math.pow(1.15, this.level - 1));
}; 