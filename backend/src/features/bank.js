// backend/src/features/bank.js
// -----------------------------------------------------------------------------
// Consolidated BANK feature
//   • Sequelize BankAccount model
//   • Express router (balance / deposit / withdraw endpoints)
//   • Daily interest cron (startBankInterest)
// -----------------------------------------------------------------------------
// Exports: BankAccount, bankRouter, startBankInterest
// -----------------------------------------------------------------------------

import express from "express";
import cron    from "node-cron";
import { Op, DataTypes, Transaction } from "sequelize";
import { sequelize } from "../config/db.js";
import { auth } from '../features/user.js';

/* Stub for socket event (optional real-time feedback) */
function notifyBankUpdate(userId, type, amount) {
  console.log(`[BANK] ${type} of ${amount} by user ${userId}`);
  // e.g. io.to(userId).emit("bankUpdate", { type, amount });
}

/* ⬆️ 1⃣️ Model */
export const BankAccount = sequelize.define(
  "BankAccount",
  {
    userId:   { type: DataTypes.INTEGER, allowNull: false, unique: true },
    balance:  { type: DataTypes.INTEGER, defaultValue: 0 },
    lastInterestAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { timestamps: false },
);

/* ⬆️ 2⃣️ Helpers */
const getAccount = async (userId, t = null) => {
  const [acc] = await BankAccount.findOrCreate({
    where: { userId },
    defaults: { balance: 0 },
    transaction: t,
  });
  return acc;
};

const validateAmount = (amount) => Number.isFinite(amount) && amount > 0;

/* ⬆️ 3⃣️ Router */
export const bankRouter = (() => {
  const router = express.Router();

  router.get("/", auth, async (req, res) => {
    try {
      const acc = await getAccount(req.user.id);
      res.json({ balance: acc.balance });
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  });

  router.post("/deposit", auth, async (req, res) => {
    const amount = Number(req.body.amount);
    if (!validateAmount(amount)) return res.status(400).send("invalid amount");

    const t = await sequelize.transaction();
    try {
      const acc = await getAccount(req.user.id, t);
      acc.balance += amount;
      await acc.save({ transaction: t });
      await t.commit();
      notifyBankUpdate(req.user.id, "deposit", amount);
      res.json({ balance: acc.balance });
    } catch (err) {
      await t.rollback();
      console.error(err);
      res.sendStatus(500);
    }
  });

  router.post("/withdraw", auth, async (req, res) => {
    const amount = Number(req.body.amount);
    if (!validateAmount(amount)) return res.status(400).send("invalid amount");

    const t = await sequelize.transaction();
    try {
      const acc = await getAccount(req.user.id, t);
      if (acc.balance < amount) {
        await t.rollback();
        return res.status(400).send("insufficient balance");
      }
      acc.balance -= amount;
      await acc.save({ transaction: t });
      await t.commit();
      notifyBankUpdate(req.user.id, "withdraw", amount);
      res.json({ balance: acc.balance });
    } catch (err) {
      await t.rollback();
      console.error(err);
      res.sendStatus(500);
    }
  });

  return router;
})();

/* ⬆️ 4⃣️ Daily interest job */
const INTEREST_RATE = parseFloat(process.env.BANK_INTEREST_RATE ?? "0.02");

export function startBankInterest() {
  cron.schedule("5 0 * * *", async () => {
    console.log("🏦  Running daily interest job …");
    const t = await sequelize.transaction();
    try {
      const accounts = await BankAccount.findAll({ transaction: t, lock: t.LOCK.UPDATE });
      const now = Date.now();
      for (const acc of accounts) {
        const diffDays = (now - new Date(acc.lastInterestAt).getTime()) / 86_400_000;
        if (diffDays >= 1) {
          const interest = Math.floor(acc.balance * INTEREST_RATE);
          acc.balance += interest;
          acc.lastInterestAt = new Date();
          await acc.save({ transaction: t });
        }
      }
      await t.commit();
      console.log("✅  Interest applied");
    } catch (err) {
      await t.rollback();
      console.error("❌  Interest job failed", err);
    }
  });
}
