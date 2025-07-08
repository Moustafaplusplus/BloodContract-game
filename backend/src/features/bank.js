// backend/src/features/bank.js
// -----------------------------------------------------------------------------
// Bank feature 3.0
//   • Keeps Character.money and BankAccount.balance in sync
//   • 5 % daily compound interest (configurable via BANK_INTEREST_RATE)
//   • BankTxn ledger and /history endpoint for InterestHistory.jsx
// -----------------------------------------------------------------------------
import express  from 'express';
import cron     from 'node-cron';
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { auth }      from '../features/user.js';
import { Character } from '../features/character.js';

/* ────────────────────────────────────────────────────────────────────────────
 * 1⃣  Models
 * ─────────────────────────────────────────────────────────────────────────── */
export const BankAccount = sequelize.define(
  'BankAccount',
  {
    userId:         { type: DataTypes.INTEGER, allowNull: false, unique: true },
    balance:        { type: DataTypes.INTEGER, defaultValue: 0 },
    lastInterestAt: { type: DataTypes.DATE,    defaultValue: DataTypes.NOW },
  },
  { timestamps: false }
);

export const BankTxn = sequelize.define(
  'BankTxn',
  {
    userId:  { type: DataTypes.INTEGER, allowNull: false },
    amount:  { type: DataTypes.INTEGER, allowNull: false }, // positive = credit
    type:    { type: DataTypes.STRING,  allowNull: false }, // "interest"
  },
  { timestamps: true }
);

/* ────────────────────────────────────────────────────────────────────────────
 * 2⃣  Helpers
 * ─────────────────────────────────────────────────────────────────────────── */
const getAccount = async (userId, t = null) =>
  (await BankAccount.findOrCreate({
    where: { userId },
    defaults: { balance: 0 },
    transaction: t,
  }))[0];

const validateAmount = (n) => Number.isFinite(n) && n > 0;

/* ────────────────────────────────────────────────────────────────────────────
 * 3⃣  Router
 * ─────────────────────────────────────────────────────────────────────────── */
export const bankRouter = (() => {
  const router = express.Router();

  /* current balance + cash ----------------------------------------------- */
  router.get('/', auth, async (req, res) => {
    try {
      const acc = await getAccount(req.user.id);
      const chr = await Character.findOne({ where: { userId: req.user.id } });
      res.json({ balance: acc.balance, money: chr?.money ?? 0 });
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  });

  /* last 30 interest credits --------------------------------------------- */
  router.get('/history', auth, async (req, res) => {
    try {
      const rows = await BankTxn.findAll({
        where: { userId: req.user.id, type: 'interest' },
        order: [['createdAt', 'DESC']],
        limit: 30,
      });
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  });

  /* deposit cash ---------------------------------------------------------- */
  router.post('/deposit', auth, async (req, res) => {
    const amount = Number(req.body.amount);
    if (!validateAmount(amount)) return res.status(400).send('invalid amount');

    const t = await sequelize.transaction();
    try {
      const [acc, chr] = await Promise.all([
        getAccount(req.user.id, t),
        Character.findOne({
          where: { userId: req.user.id },
          transaction: t,
          lock: t.LOCK.UPDATE,
        }),
      ]);

      if (!chr || chr.money < amount) {
        await t.rollback();
        return res.status(400).send('insufficient cash');
      }

      chr.money   -= amount;
      acc.balance += amount;

      await Promise.all([
        chr.save({ transaction: t }),
        acc.save({ transaction: t }),
      ]);
      await t.commit();

      res.json({ balance: acc.balance, money: chr.money });
    } catch (err) {
      await t.rollback();
      console.error(err);
      res.sendStatus(500);
    }
  });

  /* withdraw cash --------------------------------------------------------- */
  router.post('/withdraw', auth, async (req, res) => {
    const amount = Number(req.body.amount);
    if (!validateAmount(amount)) return res.status(400).send('invalid amount');

    const t = await sequelize.transaction();
    try {
      const [acc, chr] = await Promise.all([
        getAccount(req.user.id, t),
        Character.findOne({
          where: { userId: req.user.id },
          transaction: t,
          lock: t.LOCK.UPDATE,
        }),
      ]);

      if (acc.balance < amount) {
        await t.rollback();
        return res.status(400).send('insufficient balance');
      }

      acc.balance -= amount;
      chr.money   += amount;

      await Promise.all([
        chr.save({ transaction: t }),
        acc.save({ transaction: t }),
      ]);
      await t.commit();

      res.json({ balance: acc.balance, money: chr.money });
    } catch (err) {
      await t.rollback();
      console.error(err);
      res.sendStatus(500);
    }
  });

  return router;
})();

/* ────────────────────────────────────────────────────────────────────────────
 * 4⃣  Daily interest cron
 * ─────────────────────────────────────────────────────────────────────────── */
const INTEREST_RATE = parseFloat(process.env.BANK_INTEREST_RATE ?? '0.05'); // 5 %

export function startBankInterest() {
  cron.schedule('5 0 * * *', async () => {
    const t = await sequelize.transaction();
    try {
      const accounts = await BankAccount.findAll({
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      const now = Date.now();

      for (const acc of accounts) {
        const diffDays =
          (now - new Date(acc.lastInterestAt).getTime()) / 86_400_000; // ms → days

        if (diffDays >= 1) {
          const interest = Math.floor(acc.balance * INTEREST_RATE);
          acc.balance     += interest;
          acc.lastInterestAt = new Date();
          await acc.save({ transaction: t });

          // ledger entry
          await BankTxn.create(
            { userId: acc.userId, amount: interest, type: 'interest' },
            { transaction: t }
          );
        }
      }

      await t.commit();
      console.log('🏦  Interest applied');
    } catch (err) {
      await t.rollback();
      console.error('❌  Interest job failed', err);
    }
  });
}
