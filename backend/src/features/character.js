/* ---------------------------------------------------------------------------
 *  backend/src/features/character.js
 *  – progressive level-up, item bonuses, live HUD support
 * -------------------------------------------------------------------------*/
import express   from 'express';
import mongoose  from 'mongoose';
import cron      from 'node-cron';
import { DataTypes, Op } from 'sequelize';

import { sequelize } from '../config/db.js';
import { auth }      from './user.js';
import { io }        from '../socket.js';
import { Weapon, Armor } from './shop.js';

/* ─────────────────────── 0. EXP helper ────────────────────── */
export const expNeeded = (lvl) => Math.floor(100 * Math.pow(1.15, lvl - 1));

/* ─────────────────────── 1. Sequelize model ───────────────── */
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
});

/* ───── async JSON snapshot (includes item bonuses) ───── */
Character.prototype.toSafeJSON = async function () {
  const [weapon, armor] = await Promise.all([
    this.equippedWeaponId ? Weapon.findByPk(this.equippedWeaponId) : null,
    this.equippedArmorId  ? Armor.findByPk(this.equippedArmorId)   : null,
  ]);

  const bonusStr = weapon?.damage      ?? 0;
  const bonusEng = weapon?.energyBonus ?? 0;
  const bonusDef = armor ?.def         ?? 0;
  const bonusHp  = armor ?.hpBonus     ?? 0;

  return {
    id:           this.id,
    name:         this.name,
    level:        this.level,

    money:        this.money,
    exp:          this.exp,
    nextLevelExp: expNeeded(this.level),

    // current pools
    energy:       this.energy,
    hp:           this.hp,

    // caps with bonuses
    maxEnergy:    this.maxEnergy + bonusEng,
    maxHp:        this.maxHp     + bonusHp,

    // combat totals
    strength:     this.strength + bonusStr,
    defense:      this.defense  + bonusDef,
  };
};

/* ─────────────────────── 2. Stats (mongoose) ──────────────── */
const statSchema = new mongoose.Schema({
  userId:     { type: Number, required: true, unique: true, index: true },
  crimes:     { type: Number, default: 0 },
  fights:     { type: Number, default: 0 },
  daysOnline: { type: Number, default: 0 },
}, { timestamps: true });

export const Statistic = mongoose.models.Statistic ||
                         mongoose.model('Statistic', statSchema);

/* ─────────────────────── 3. EXP rules ─────────────────────── */
export const ACTIONS = {
  CRIME_SUCCESS:  'CRIME_SUCCESS',
  CRIME_FAIL:     'CRIME_FAIL',
  FIGHT_WIN:      'FIGHT_WIN',
  DAILY_LOGIN:    'DAILY_LOGIN',
  TRAIN_STRENGTH: 'TRAIN_STRENGTH',
  TRAIN_DEFENSE:  'TRAIN_DEFENSE',
};

const EXP_RULES = {
  [ACTIONS.CRIME_SUCCESS]:  20,
  [ACTIONS.CRIME_FAIL]:      5,
  [ACTIONS.FIGHT_WIN]:      50,
  [ACTIONS.DAILY_LOGIN]:    15,
  [ACTIONS.TRAIN_STRENGTH]:  3,
  [ACTIONS.TRAIN_DEFENSE]:   3,
};

export async function giveReward({ character, action }, tx = null) {
  const xp = EXP_RULES[action] ?? 0;
  if (xp) {
    character.exp += xp;
    await maybeLevelUp(character);
  }
  await character.save({ transaction: tx });
  return xp;
}

/* ─────────────────────── 4. Level-up helpers ──────────────── */
function applyLevelBonuses(char) {
  char.maxEnergy += 2;
  char.maxHp     += 2;

  const bonus = Math.ceil(char.level / 5); // every 5 levels
  char.strength += bonus;
  char.defense  += bonus;
}

export async function maybeLevelUp(char) {
  let needed = expNeeded(char.level);
  while (char.exp >= needed) {
    char.exp   -= needed;
    char.level += 1;

    applyLevelBonuses(char);

    // mini-refill
    char.energy = Math.min(char.energy + 2, char.maxEnergy);
    char.hp     = Math.min(char.hp + 2, char.maxHp);

    needed = expNeeded(char.level);
  }
}

export async function addStat(userId, field, delta = 1) {
  await Statistic.updateOne({ userId }, { $inc: { [field]: delta } }, { upsert: true });
}

/* ─────────────────────── 5. Express router ──────────────── */
export const characterRouter = (() => {
  const router = express.Router();

  router.get('/', auth, async (req, res) => {
    const char = await Character.findOne({ where: { userId: req.user.id } });
    if (!char) return res.status(404).json({ error: 'Character not found' });
    return res.json(await char.toSafeJSON());
  });

  router.post('/train', auth, async (req, res) => {
    const { attr } = req.body;
    if (!['strength', 'defense'].includes(attr)) {
      return res.status(400).json({ error: 'Invalid attr' });
    }

    const char = await Character.findOne({ where: { userId: req.user.id } });
    if (!char) return res.status(404).json({ error: 'Character not found' });
    if (char.energy < 2) return res.status(400).json({ error: 'Not enough energy' });

    char[attr]  += 1;
    char.energy -= 2;
    await char.save();
    await giveReward({
      character: char,
      action: attr === 'strength' ? ACTIONS.TRAIN_STRENGTH : ACTIONS.TRAIN_DEFENSE,
    });

    return res.json(await char.toSafeJSON());
  });

  router.get('/stats', auth, async (req, res) => {
    const stats = await Statistic.findOne({ userId: req.user.id }).lean();
    return res.json(stats || {});
  });

  return router;
})();

/* ─────────────────────── 6. Cron jobs ────────────────────── */
const ENERGY_REGEN_RATE = 1;
const HEALTH_REGEN_RATE = 2;

function emitEnergyUpdate(char) {
  io?.to(`user:${char.userId}`).emit('energyUpdate', {
    energy:    char.energy,
    maxEnergy: char.maxEnergy,
  });
}

export function startEnergyRegen() {
  cron.schedule('* * * * *', async () => {
    try {
      const chars = await Character.findAll({
        where: { energy: { [Op.lt]: sequelize.col('maxEnergy') } },
      });
      for (const char of chars) {
        char.energy = Math.min(char.energy + ENERGY_REGEN_RATE, char.maxEnergy);
        await char.save();
        emitEnergyUpdate(char);
      }
    } catch (err) { console.error('[EnergyRegen] failed', err); }
  });
}

export function startHealthRegen() {
  cron.schedule('*/2 * * * *', async () => {
    try {
      await Character.increment({ hp: HEALTH_REGEN_RATE }, {
        where: { hp: { [Op.lt]: sequelize.col('maxHp') } },
      });
    } catch (err) { console.error('[HealthRegen] failed', err); }
  });
}
