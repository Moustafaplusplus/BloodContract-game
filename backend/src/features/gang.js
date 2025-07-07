// =======================================================
//  backend/src/features/gang.js
//  Features:
//    • Gang mongoose schema
//    • /gangs & /my-gang routes
// =======================================================

import { Router } from 'express';
import mongoose from 'mongoose';
import { Character } from './character.js';
import { auth } from './user.js';

/* =====================================================================
 * 1) Mongoose model
 * =====================================================================*/
const GangSchema = new mongoose.Schema({
  name:        { type: String, required: true, unique: true, trim: true },
  description: { type: String, default: '' },
  leader:      { type: mongoose.Schema.Types.ObjectId, ref: 'Character', required: true },
  members:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'Character' }],
  createdAt:   { type: Date,  default: Date.now },
});

export const Gang = mongoose.model('Gang', GangSchema);

/* =====================================================================
 * 2) Express Router
 * =====================================================================*/
export const gangRouter = Router();

// GET /gangs
// List all gangs (paginated)
gangRouter.get('/gangs', async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const safeLimit = Math.max(1, Math.min(Number(limit) || 20, 100));
  const safePage = Math.max(1, Number(page) || 1);

  const gangs = await Gang.find()
    .select('name description members leader')
    .skip((safePage - 1) * safeLimit)
    .limit(safeLimit)
    .lean();

  res.json({ gangs, page: safePage, limit: safeLimit });
});

// POST /gangs
// Create new gang
gangRouter.post('/gangs', auth, async (req, res) => {
  const { name, description = '' } = req.body;
  if (!name) return res.status(400).json({ message: 'Name required' });

  const charId = req.user.id;
  const existing = await Gang.findOne({ members: charId });
  if (existing) return res.status(400).json({ message: 'Already in a gang' });

  const gang = await Gang.create({
    name,
    description,
    leader: charId,
    members: [charId],
  });

  res.status(201).json(gang);
});

// GET /gangs/:id
// Get gang details
gangRouter.get('/gangs/:id', async (req, res) => {
  const gang = await Gang.findById(req.params.id)
    .populate('leader', 'username level')
    .populate('members', 'username level')
    .lean();

  if (!gang) return res.status(404).json({ message: 'Not found' });
  res.json(gang);
});

// POST /gangs/:id/join
gangRouter.post('/gangs/:id/join', auth, async (req, res) => {
  const gang = await Gang.findById(req.params.id);
  if (!gang) return res.status(404).json({ message: 'Not found' });

  const charId = req.user.id;
  if (gang.members.includes(charId))
    return res.status(400).json({ message: 'Already a member' });

  gang.members.push(charId);
  await gang.save();
  res.json({ message: 'Joined gang' });
});

// POST /gangs/:id/leave
gangRouter.post('/gangs/:id/leave', auth, async (req, res) => {
  const gang = await Gang.findById(req.params.id);
  if (!gang) return res.status(404).json({ message: 'Not found' });

  const charId = req.user.id;
  if (!gang.members.includes(charId))
    return res.status(400).json({ message: 'Not a member' });

  if (gang.leader.equals(charId)) {
    await gang.deleteOne();
    return res.json({ message: 'Gang disbanded' });
  }

  gang.members = gang.members.filter((m) => !m.equals(charId));
  await gang.save();
  res.json({ message: 'Left gang' });
});

// GET /my-gang
gangRouter.get('/my-gang', auth, async (req, res) => {
  const gang = await Gang.findOne({ members: req.user.id })
    .populate('leader', 'username level')
    .populate('members', 'username level');

  if (!gang) return res.status(204).end();
  res.json(gang);
});

/* =====================================================================
 * 3) Barrel export
 * =====================================================================*/
export default {
  Gang,
  gangRouter,
};
