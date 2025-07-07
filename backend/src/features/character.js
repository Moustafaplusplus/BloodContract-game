// backend/src/features/character.js – revised defaults + live energy emit
// -----------------------------------------------------------------------------
import express from "express";
import mongoose from "mongoose";
import cron from "node-cron";
import { DataTypes, Op } from "sequelize";
import { sequelize } from "../config/db.js";
import { auth } from "../features/user.js";
import { io } from "../socket.js"; // <- assumed socket.io instance

/* ────────────────────────────────────────────────────────────────────────────
 * 1️⃣ Sequelize Character model (new defaults)
 * ─────────────────────────────────────────────────────────────────────────── */
export const Character = sequelize.define("character", {
  userId:         { type: DataTypes.INTEGER, allowNull: false, unique: true },
  name:           { type: DataTypes.STRING,  allowNull: false },
  level:          { type: DataTypes.INTEGER, defaultValue: 1 },
  exp:            { type: DataTypes.INTEGER, defaultValue: 0 },

  // ⇩ Updated starting stats
  money:          { type: DataTypes.INTEGER, defaultValue: 1500 },
  strength:       { type: DataTypes.INTEGER, defaultValue: 10 },
  defense:        { type: DataTypes.INTEGER, defaultValue: 5 },

  maxEnergy:      { type: DataTypes.INTEGER, defaultValue: 100 },
  energy:         { type: DataTypes.INTEGER, defaultValue: 100 },
  maxHp:          { type: DataTypes.INTEGER, defaultValue: 100 },
  hp:             { type: DataTypes.INTEGER, defaultValue: 100 },
  crimeCooldown:  { type: DataTypes.BIGINT,  defaultValue: 0 },
});

// ➡️ Safe JSON helper for sockets / API
Character.prototype.toSafeJSON = function () {
  return {
    id:       this.id,
    name:     this.name,
    level:    this.level,
    money:    this.money,
    energy:   this.energy,
    hp:       this.hp,
    exp:      this.exp,
    strength: this.strength,
    defense:  this.defense,
  };
};

/* ────────────────────────────────────────────────────────────────────────────
 * 2️⃣ Mongoose Statistic model
 * ─────────────────────────────────────────────────────────────────────────── */
const statSchema = new mongoose.Schema({
  userId:     { type: Number, required: true, index: true, unique: true },
  crimes:     { type: Number, default: 0 },
  fights:     { type: Number, default: 0 },
  daysOnline: { type: Number, default: 0 },
}, { timestamps: true });

export const Statistic = mongoose.models.Statistic || mongoose.model("Statistic", statSchema);

/* ────────────────────────────────────────────────────────────────────────────
 * 3️⃣ EXP rules + reward service
 * ─────────────────────────────────────────────────────────────────────────── */
export const ACTIONS = {
  CRIME_SUCCESS:   "CRIME_SUCCESS",
  CRIME_FAIL:      "CRIME_FAIL",
  FIGHT_WIN:       "FIGHT_WIN",
  DAILY_LOGIN:     "DAILY_LOGIN",
  TRAIN_STRENGTH:  "TRAIN_STRENGTH",
  TRAIN_DEFENSE:   "TRAIN_DEFENSE",
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

/* ────────────────────────────────────────────────────────────────────────────
 * 4️⃣ Level-up helpers
 * ─────────────────────────────────────────────────────────────────────────── */
export async function maybeLevelUp(char) {
  let needed = expNeeded(char.level);
  while (char.exp >= needed) {
    char.exp   -= needed;
    char.level += 1;
    char.maxEnergy += 2;
    char.maxHp    += 2;
    needed = expNeeded(char.level);
  }
}
export const expNeeded = lvl => Math.floor(100 * Math.pow(1.15, lvl - 1));

export async function addStat(userId, field, delta = 1) {
  await Statistic.updateOne({ userId }, { $inc: { [field]: delta } }, { upsert: true });
}

/* ────────────────────────────────────────────────────────────────────────────
 * 5️⃣ Router
 * ─────────────────────────────────────────────────────────────────────────── */
export const characterRouter = (() => {
  const router = express.Router();

  router.get("/", auth, async (req, res) => {
    const char = await Character.findOne({ where: { userId: req.user.id } });
    if (!char) return res.status(404).json({ error: "Character not found" });
    res.json(char.toSafeJSON());
  });

  router.post("/train", auth, async (req, res) => {
    const { attr } = req.body;
    if (![`strength`, `defense`].includes(attr)) return res.status(400).json({ error: "Invalid attr" });

    const char = await Character.findOne({ where: { userId: req.user.id } });
    if (!char) return res.status(404).json({ error: "Character not found" });
    if (char.energy < 2) return res.status(400).json({ error: "Not enough energy" });

    char[attr]  += 1;
    char.energy -= 2;
    await char.save();
    await giveReward({ character: char, action: attr === "strength" ? ACTIONS.TRAIN_STRENGTH : ACTIONS.TRAIN_DEFENSE });

    res.json(char.toSafeJSON());
  });

  router.get("/stats", auth, async (req, res) => {
    const stats = await Statistic.findOne({ userId: req.user.id }).lean();
    res.json(stats || {});
  });

  return router;
})();

/* ────────────────────────────────────────────────────────────────────────────
 * 6️⃣ Cron jobs (live emits)
 * ─────────────────────────────────────────────────────────────────────────── */
const ENERGY_REGEN_RATE = 1;
const HEALTH_REGEN_RATE = 2;

function emitEnergyUpdate(char) {
  if (io) io.to(`user:${char.userId}`).emit("energyUpdate", { energy: char.energy, maxEnergy: char.maxEnergy });
}

export function startEnergyRegen() {
  // Every minute
  cron.schedule("* * * * *", async () => {
    try {
      const chars = await Character.findAll({ where: { energy: { [Op.lt]: sequelize.col("maxEnergy") } } });
      for (const char of chars) {
        char.energy = Math.min(char.energy + ENERGY_REGEN_RATE, char.maxEnergy);
        await char.save();
        emitEnergyUpdate(char); // notify if online
      }
    } catch (err) {
      console.error("[EnergyRegen] failed", err);
    }
  });
}

export function startHealthRegen() {
  cron.schedule("*/2 * * * *", async () => {
    try {
      await Character.increment({ hp: HEALTH_REGEN_RATE }, {
        where: { hp: { [Op.lt]: sequelize.col("maxHp") } },
      });
    } catch (err) {
      console.error("[HealthRegen] failed", err);
    }
  });
}
