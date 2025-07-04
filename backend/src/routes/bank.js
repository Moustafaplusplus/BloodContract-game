// backend/src/routes/bank.js
import express from 'express';
import jwt from 'jsonwebtoken';
import BankAccount from '../models/bankAccount.js';

const router = express.Router();

// helper to get or create the user’s bank account
const getAccount = async (userId) => {
  const [account] = await BankAccount.findOrCreate({ where: { userId } });
  return account;
};

// GET /api/bank   →  { balance }
router.get('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.sendStatus(401);
    const { id: userId } = jwt.verify(token, process.env.JWT_SECRET);

    const account = await getAccount(userId);
    res.json({ balance: account.balance });
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

// POST /api/bank/deposit { amount }
router.post('/deposit', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.sendStatus(401);
    const { id: userId } = jwt.verify(token, process.env.JWT_SECRET);

    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).send('invalid amount');

    const account = await getAccount(userId);
    account.balance += amount;
    await account.save();

    res.json({ balance: account.balance });
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

// POST /api/bank/withdraw { amount }
router.post('/withdraw', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.sendStatus(401);
    const { id: userId } = jwt.verify(token, process.env.JWT_SECRET);

    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).send('invalid amount');

    const account = await getAccount(userId);
    if (account.balance < amount)
      return res.status(400).send('insufficient balance');

    account.balance -= amount;
    await account.save();

    res.json({ balance: account.balance });
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

export default router;
