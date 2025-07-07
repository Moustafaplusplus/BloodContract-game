// backend/src/features/crimes.js – balanced XP + 5-energy baseline
// -----------------------------------------------------------------------------
// Consolidated "crimes" feature module – model definitions, utility helpers,
// REST routes, and optional seeder.
// -----------------------------------------------------------------------------
// Key changes vs previous version
//   • All crimes now consume **≥5** energy (energyCost default 5)
//   • XP reward scales with difficulty/energyCost instead of flat constants:
//       success XP  = energyCost × 2
//       failure XP  = energyCost × 0.5  (rounded)
//   • crimeRouter /execute responds with expGain that actually got added
// -----------------------------------------------------------------------------

import express       from "express";
import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

import { auth }             from "../features/user.js";
import { Hospital, Jail }   from "./confinement.js";
import { Character, maybeLevelUp } from "./character.js";

/* ────────────────────────────────────────────────────────────────────────────
 * 1️⃣ Models
 * ─────────────────────────────────────────────────────────────────────────── */
export const Crime = sequelize.define("crime", {
  name:        { type: DataTypes.STRING,  allowNull: false },
  slug:        { type: DataTypes.STRING,  allowNull: false, unique: true },
  isEnabled:   { type: DataTypes.BOOLEAN, defaultValue: true },

  req_level:   { type: DataTypes.INTEGER, defaultValue: 1 },
  req_intel:   { type: DataTypes.INTEGER, defaultValue: 1 },

  // ▶️ Baseline energy cost now 5 instead of 10
  energyCost:  { type: DataTypes.INTEGER, defaultValue: 5 },

  successRate: { type: DataTypes.FLOAT,   defaultValue: 0.5 },
  minReward:   { type: DataTypes.INTEGER, defaultValue: 50 },
  maxReward:   { type: DataTypes.INTEGER, defaultValue: 150 },
  cooldown:    { type: DataTypes.INTEGER, defaultValue: 60 },

  failOutcome:     { type: DataTypes.ENUM("jail", "hospital", "both"), defaultValue: "both" },
  jailMinutes:     { type: DataTypes.INTEGER, defaultValue: 3 },
  hospitalMinutes: { type: DataTypes.INTEGER, defaultValue: 2 },
  hpLoss:          { type: DataTypes.INTEGER, defaultValue: 20 },

  bailRate:  { type: DataTypes.INTEGER, defaultValue: 50 },
  healRate:  { type: DataTypes.INTEGER, defaultValue: 40 },
});

export const CrimeLog = sequelize.define("CrimeLog", {
  userId:  DataTypes.INTEGER,
  crimeId: DataTypes.INTEGER,
  success: DataTypes.BOOLEAN,
  payout:  DataTypes.INTEGER,
  ts:      { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { timestamps: false });

/* ────────────────────────────────────────────────────────────────────────────
 * 2️⃣ Utility helpers
 * ─────────────────────────────────────────────────────────────────────────── */
export function calcChance(level = 1, baseRate = 0.5) {
  const bonus = level * 0.01; // +1 % per level
  return Math.min(0.95, Math.max(0.05, baseRate + bonus));
}
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/* ────────────────────────────────────────────────────────────────────────────
 * 3️⃣ Router
 * ─────────────────────────────────────────────────────────────────────────── */
export const crimeRouter = (() => {
  const router = express.Router();

  router.get("/", auth, async (req, res) => {
    try {
      const level  = req.user.level ?? 1;
      const crimes = await Crime.findAll({ where: { isEnabled: true } });
      const list = crimes.filter(c => c.req_level <= level).map(c => ({
        id:         c.id,
        name:       c.name,
        req_level:  c.req_level,
        energyCost: c.energyCost,
        minReward:  c.minReward,
        maxReward:  c.maxReward,
        cooldown:   c.cooldown,
        chance:     Math.round(calcChance(level, c.successRate) * 100),
      }));
      res.json(list);
    } catch (e) {
      console.error("[crimes] list error", e);
      res.status(500).json({ error: "Server error" });
    }
  });

  const runCrime = async (req, res) => {
    const crimeId = parseInt(req.params.crimeId ?? req.body.crimeId, 10);
    if (!crimeId) return res.status(400).json({ error: "crimeId required" });

    const tx = await sequelize.transaction();
    try {
      const crime = await Crime.findByPk(crimeId, { transaction: tx });
      if (!crime || !crime.isEnabled) throw { status: 404, msg: "Crime not found" };

      const character = await Character.findOne({ where: { userId: req.user.id }, transaction: tx, lock: tx.LOCK.UPDATE });
      if (!character) throw { status: 404, msg: "Character not found" };

      if (character.level < crime.req_level)  throw { status: 400, msg: "Level too low" };
      if (character.energy < crime.energyCost) throw { status: 400, msg: "Not enough energy" };
      if (crime.req_intel && character.intel < crime.req_intel) throw { status: 400, msg: "Not enough intelligence" };

      const nowMs = Date.now();
      if (character.crimeCooldown && character.crimeCooldown > nowMs) {
        const secLeft = Math.ceil((character.crimeCooldown - nowMs) / 1000);
        throw { status: 429, msg: "Crime on cooldown", meta: { cooldownLeft: secLeft } };
      }

      /* core outcome */
      const success = Math.random() < calcChance(character.level, Number(crime.successRate));
      const payout  = success ? randInt(crime.minReward, crime.maxReward) : 0;

      // XP scales with energy cost (rounded)
      const expGain = success ? crime.energyCost * 2 : Math.round(crime.energyCost * 0.5);

      // apply cash + xp
      if (payout) character.money += payout;
      character.exp += expGain;
      await maybeLevelUp(character);

      /* failure consequences */
      let redirect = null;
      if (!success) {
        if (crime.failOutcome === "jail" || crime.failOutcome === "both") {
          redirect = "/jail";
          await Jail.create({
            userId: character.id,
            minutes: crime.jailMinutes,
            bailRate: crime.bailRate,
            releasedAt: new Date(nowMs + crime.jailMinutes * 60_000),
          }, { transaction: tx });
        }
        if (crime.failOutcome === "hospital" || (crime.failOutcome === "both" && !redirect)) {
          redirect = "/hospital";
          await Hospital.create({
            userId: character.id,
            minutes: crime.hospitalMinutes,
            hpLoss: crime.hpLoss,
            healRate: crime.healRate,
            releasedAt: new Date(nowMs + crime.hospitalMinutes * 60_000),
          }, { transaction: tx });
        }
      }

      /* energy + cooldown */
      character.energy -= crime.energyCost;
      character.crimeCooldown = nowMs + crime.cooldown * 1000;
      await character.save({ transaction: tx });

      // audit log
      await CrimeLog.create({
        userId: character.id,
        crimeId: crime.id,
        success,
        payout,
      }, { transaction: tx });

      await tx.commit();
      res.json({ success, payout, expGain, energyLeft: character.energy, cooldownLeft: crime.cooldown, redirect });
    } catch (err) {
      await tx.rollback();
      const status = err.status || 500;
      res.status(status).json({ error: err.msg || "Server error", ...(err.meta || {}) });
    }
  };

  router.post("/execute/:crimeId", auth, runCrime);
  router.post("/execute", auth, runCrime);
  return router;
})();

/* ────────────────────────────────────────────────────────────────────────────
 * 4️⃣ Seeder (energy baseline fixed)
 * ─────────────────────────────────────────────────────────────────────────── */
export async function seedCrimes() {
  const baseCrimes = [
    { name: "سرقة محفظة في الزحام",                lvl: 1,  energy: 5,  rate: 0.9,  min: 15,  max: 40,  cd: 60  },
    { name: "رشّ كتابات على حائط عام",             lvl: 1,  energy: 5,  rate: 0.88, min: 20,  max: 45,  cd: 90 },
    { name: "سرقة دراجة هوائية",                  lvl: 2,  energy: 7,  rate: 0.85, min: 25,  max: 60,  cd: 120 },
    // … extend list as needed
  ];

  const toSlug = str => str.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").toLowerCase();

  const crimes = baseCrimes.map((c, i) => ({
    name: c.name,
    slug: `${toSlug(c.name)}-${i+1}`,
    isEnabled: true,
    req_level: c.lvl,
    req_intel: Math.max(1, Math.floor(c.lvl / 2)),
    energyCost: c.energy,
    successRate: c.rate,
    minReward: c.min,
    maxReward: c.max,
    cooldown: c.cd,
    failOutcome: c.lvl % 3 === 0 ? "both" : c.lvl % 2 === 0 ? "hospital" : "jail",
    jailMinutes: Math.ceil(c.lvl / 2),
    hospitalMinutes: Math.ceil(c.lvl / 3),
    hpLoss: 10 + c.lvl * 2,
    bailRate: 50 * Math.ceil(c.lvl / 2),
    healRate: 40 * Math.ceil(c.lvl / 3),
  }));

  await Crime.destroy({ where: {} });
  await Crime.bulkCreate(crimes);
  console.log(`✅ Seeded ${crimes.length} crimes (baseline energy ≥5)`);
}