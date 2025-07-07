// backend/src/features/confinement.js – improved transactions & money calc
// -----------------------------------------------------------------------------
// Consolidated CONFINEMENT feature – Jail + Hospital
//   • Jail model
//   • Hospital model
//   • Express routers (jailRouter, hospitalRouter)
// -----------------------------------------------------------------------------
// Exports: Jail, Hospital, jailRouter, hospitalRouter
// -----------------------------------------------------------------------------

import express from "express";
import { DataTypes, Op } from "sequelize";
import { sequelize } from "../config/db.js";
import { auth } from "../features/user.js";
import { Character } from "./character.js";
import { io } from "../socket.js";

/* ── 1️⃣ Models ───────────────────────────────────────────────────────────── */
export const Jail = sequelize.define("Jail", {
  userId:     { type: DataTypes.INTEGER, allowNull: false },
  minutes:    { type: DataTypes.INTEGER, allowNull: false },
  bailRate:   { type: DataTypes.INTEGER, allowNull: false, defaultValue: 5 }, // $ per min
  startedAt:  { type: DataTypes.DATE,    allowNull: false, defaultValue: DataTypes.NOW },
  releasedAt: { type: DataTypes.DATE,    allowNull: false },
  crimeId:    { type: DataTypes.INTEGER, allowNull: true },
}, { tableName: "Jails", timestamps: false });

export const Hospital = sequelize.define("Hospital", {
  userId:     { type: DataTypes.INTEGER, allowNull: false },
  minutes:    { type: DataTypes.INTEGER, allowNull: false },
  hpLoss:     { type: DataTypes.INTEGER, allowNull: false, field: "hpLost" },
  healRate:   { type: DataTypes.INTEGER, allowNull: false, defaultValue: 3 },
  startedAt:  { type: DataTypes.DATE,    allowNull: false, defaultValue: DataTypes.NOW },
  releasedAt: { type: DataTypes.DATE,    allowNull: false, field: "releaseAt" },
  crimeId:    { type: DataTypes.INTEGER, allowNull: true },
}, { tableName: "Hospitals", timestamps: false });

/* ── 2️⃣ Helpers ─────────────────────────────────────────────────────────── */
const now = () => new Date();
const minutesLeft = (releasedAt) => Math.max(0, Math.ceil((releasedAt.getTime() - Date.now()) / 60000));

function emitStatus(userId, payload) {
  if (io) io.to(`user:${userId}`).emit("confinementUpdate", payload);
}

/* ── 3️⃣ Jail router ──────────────────────────────────────────────────────── */
export const jailRouter = (() => {
  const router = express.Router();
  const BASE_BAIL = 50;
  const RATE      = 5; // per minute

  router.get("/", auth, async (req, res) => {
    const rec = await Jail.findOne({ where: { userId: req.user.id, releasedAt: { [Op.gt]: now() } } });
    if (!rec) return res.json({ inJail: false });
    const mins = minutesLeft(rec.releasedAt);
    return res.json({ inJail: true, remainingSeconds: mins * 60, cost: BASE_BAIL + mins * RATE, crimeId: rec.crimeId });
  });

  router.post("/bail", auth, async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const rec = await Jail.findOne({ where: { userId: req.user.id, releasedAt: { [Op.gt]: now() } }, transaction: t, lock: t.LOCK.UPDATE });
      if (!rec) {
        await t.rollback();
        return res.status(400).json({ error: "Not in jail" });
      }

      const mins = minutesLeft(rec.releasedAt);
      const cost = BASE_BAIL + mins * RATE;

      const char = await Character.findOne({ where: { userId: req.user.id }, transaction: t, lock: t.LOCK.UPDATE });
      if (char.money < cost) {
        await t.rollback();
        return res.status(400).json({ error: "Insufficient funds" });
      }

      char.money -= cost;
      await char.save({ transaction: t });
      await rec.destroy({ transaction: t });

      await t.commit();
      emitStatus(req.user.id, { type: "bailed", remainingSeconds: 0 });
      res.json({ success: true, newCash: char.money });
    } catch (err) {
      await t.rollback();
      console.error(err);
      res.status(500).json({ error: "Bail failed" });
    }
  });

  return router;
})();

/* ── 4️⃣ Hospital router ──────────────────────────────────────────────────── */
export const hospitalRouter = (() => {
  const router = express.Router();
  const BASE_HEAL = 40;
  const RATE      = 4; // per minute

  router.get("/", auth, async (req, res) => {
    const rec = await Hospital.findOne({ where: { userId: req.user.id, releasedAt: { [Op.gt]: now() } } });
    if (!rec) return res.json({ inHospital: false });
    const mins = minutesLeft(rec.releasedAt);
    res.json({ inHospital: true, remainingSeconds: mins * 60, cost: BASE_HEAL + mins * RATE, crimeId: rec.crimeId, hpLoss: rec.hpLoss });
  });

  router.post("/heal", auth, async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const rec = await Hospital.findOne({ where: { userId: req.user.id, releasedAt: { [Op.gt]: now() } }, transaction: t, lock: t.LOCK.UPDATE });
      if (!rec) {
        await t.rollback();
        return res.status(400).json({ error: "Not in hospital" });
      }
      const mins = minutesLeft(rec.releasedAt);
      const cost = BASE_HEAL + mins * RATE;

      const char = await Character.findOne({ where: { userId: req.user.id }, transaction: t, lock: t.LOCK.UPDATE });
      if (char.money < cost) {
        await t.rollback();
        return res.status(400).json({ error: "Insufficient funds" });
      }

      char.money -= cost;
      char.hp    = Math.min(char.hp + rec.hpLoss, char.maxHp);
      await char.save({ transaction: t });
      await rec.destroy({ transaction: t });

      await t.commit();
      emitStatus(req.user.id, { type: "healed", hp: char.hp });
      res.json({ success: true, newCash: char.money, hp: char.hp });
    } catch (err) {
      await t.rollback();
      console.error(err);
      res.status(500).json({ error: "Heal failed" });
    }
  });

  return router;
})();