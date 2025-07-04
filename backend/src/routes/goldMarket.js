// ─────────────────────────  Route: Gold Market  ───────────────
// File: backend/src/routes/goldMarket.js
// -------------------------------------------------------------
import { Router }      from 'express';
import authMiddleware  from '../middlewares/auth.js';          // ✅ default import fixed
import Character       from '../models/character.js';
import { processPayment } from '../utils/paymentProvider.js';

const router = Router();

// POST /gold-market/buy → buy gold with real money
router.post('/buy', authMiddleware, async (req, res) => {
  const { amountUSD } = req.body;
  if (!amountUSD || amountUSD <= 0) {
    return res.status(400).json({ message: 'Invalid amount' });
  }

  const goldAmount = amountUSD * 10; // 1 USD = 10 Gold example rate

  const payment = await processPayment({ userId: req.user.id, amountUSD });
  if (!payment.success) {
    return res.status(402).json({ message: 'Payment failed' });
  }

  const player = await Character.findById(req.user.id);
  player.gold = (player.gold || 0) + goldAmount;
  await player.save();

  res.json({
    message: 'Gold purchased',
    goldGranted: goldAmount,
    transactionId: payment.transactionId
  });
});

// POST /gold-market/buy-vip → spend gold for VIP perks
router.post('/buy-vip', authMiddleware, async (req, res) => {
  const { tier } = req.body;
  const prices = { silver: 500, gold: 1000, platinum: 2000 };
  const price = prices[tier];

  if (!price) return res.status(400).json({ message: 'Invalid tier' });

  const player = await Character.findById(req.user.id);
  if ((player.gold || 0) < price) {
    return res.status(400).json({ message: 'Not enough gold' });
  }

  player.gold       -= price;
  player.vipTier     = tier;
  player.vipExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  await player.save();

  res.json({ message: `VIP ${tier} activated for 30 days` });
});

export default router;
