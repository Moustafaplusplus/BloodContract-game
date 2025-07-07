// =======================================================
//  backend/src/features/gold.js
//  Gold shop – purchase gold & VIP memberships
//  Enhancements:
//    • Seed helper with suggested price tiers (USD → Gold)
//    • Centralised constants for VIP pricing
// =======================================================

/* ───────── external deps ───────── */
import express  from 'express';
import mongoose from 'mongoose';

/* ───────── internal deps ──────── */
import { Character, maybeLevelUp } from './character.js';
import { auth } from '../features/user.js';

/* ───────────────────────────────────────────────────────────
 * 0️⃣  Suggested price tiers (seed data)
 * ─────────────────────────────────────────────────────────── */
export const GOLD_PACKAGES = [
  { id: 'starter',   usd:  5, gold:  50 },   // no bonus
  { id: 'small',     usd: 10, gold: 110 },   // +10 bonus
  { id: 'medium',    usd: 25, gold: 300 },   // +50 bonus
  { id: 'large',     usd: 50, gold: 650 },   // +150 bonus
  { id: 'whale',     usd:100, gold:1400 },   // +400 bonus
];

export const VIP_PRICES = { silver: 500, gold: 1000, platinum: 2000 };

/* ───────────────────────────────────────────────────────────
 * 1️⃣  Mongoose model: GoldTransaction
 * ─────────────────────────────────────────────────────────── */
const goldTxSchema = new mongoose.Schema({
  character: { type: mongoose.Schema.Types.ObjectId, ref: 'Character', required: true },
  amount:    { type: Number, required: true, min: 1 },
  kind:      { type: String, enum: ['buy', 'spend'], required: true },
  ref:       { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const GoldTransaction = mongoose.model('GoldTransaction', goldTxSchema);

/* ───────────────────────────────────────────────────────────
 * 2️⃣  Payment provider stub (replace in prod)
 * ─────────────────────────────────────────────────────────── */
export async function processPayment({ userId, amountUSD }) {
  console.log(`💳  Mock charge: $${amountUSD} from user ${userId}`);
  return { success: true, transactionId: 'mock-' + Date.now() };
}

/* ───────────────────────────────────────────────────────────
 * 3️⃣  Express router: /gold-market/*
 * ─────────────────────────────────────────────────────────── */
export const router = express.Router();

// Helper – find package by id or usd amount
function resolvePackage({ packageId, amountUSD }) {
  if (packageId) return GOLD_PACKAGES.find(p => p.id === packageId);
  if (amountUSD) return GOLD_PACKAGES.find(p => p.usd === Number(amountUSD));
  return null;
}

/**
 * POST /gold-market/buy
 * Body: { packageId?: string, amountUSD?: number }
 */
router.post('/gold-market/buy', auth, async (req, res) => {
  const { packageId, amountUSD } = req.body;
  const pack = resolvePackage({ packageId, amountUSD });

  if (!pack) return res.status(400).json({ message: 'Invalid package / amount' });

  const payment = await processPayment({ userId: req.user.id, amountUSD: pack.usd });
  if (!payment.success) return res.status(402).json({ message: 'Payment failed' });

  const char = await Character.findById(req.user.id);
  char.gold = (char.gold || 0) + pack.gold;
  await char.save();

  await GoldTransaction.create({
    character: char._id,
    amount: pack.gold,
    kind: 'buy',
    ref: payment.transactionId,
  });

  res.json({ message: 'Gold purchased', goldGranted: pack.gold, transactionId: payment.transactionId });
});

/**
 * POST /gold-market/buy-vip
 * Body: { tier: 'silver' | 'gold' | 'platinum' }
 */
router.post('/gold-market/buy-vip', auth, async (req, res) => {
  const { tier } = req.body;
  const price = VIP_PRICES[tier];
  if (!price) return res.status(400).json({ message: 'Invalid tier' });

  const char = await Character.findById(req.user.id);
  if ((char.gold || 0) < price) return res.status(400).json({ message: 'Not enough gold' });

  char.gold        -= price;
  char.vipTier      = tier;
  char.vipExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await char.save();

  await GoldTransaction.create({
    character: char._id,
    amount: price,
    kind: 'spend',
    ref: `vip-${tier}`,
  });

  res.json({ message: `VIP ${tier} activated for 30 days` });
});

/* ───────────────────────────────────────────────────────────
 * 4️⃣  Seed helper – inserts suggested packages into a collection
 *     (Optional; call manually during setup)
 * ─────────────────────────────────────────────────────────── */
const goldPackageSchema = new mongoose.Schema({ id: String, usd: Number, gold: Number });
const GoldPackage = mongoose.models.GoldPackage || mongoose.model('GoldPackage', goldPackageSchema);

export async function seedGoldPackages() {
  await GoldPackage.deleteMany({});
  await GoldPackage.insertMany(GOLD_PACKAGES);
  console.log(`✅ Seeded ${GOLD_PACKAGES.length} gold packages`);
}

/* ───────────────────────────────────────────────────────────
 * 5️⃣  Barrel export
 * ─────────────────────────────────────────────────────────── */
export default {
  GOLD_PACKAGES,
  VIP_PRICES,
  GoldTransaction,
  processPayment,
  router,
  seedGoldPackages,
};