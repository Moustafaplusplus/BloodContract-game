// ─────────────────────────  BACKEND  ─────────────────────────
// File: backend/src/routes/gang.js
//--------------------------------------------------------------
import { Router } from 'express';
import auth from '../middlewares/auth.js';
import Gang from '../models/gang.js';
import Character from '../models/character.js';

const router = Router();

// GET /gangs – list all gangs (basic pagination)
router.get('/gangs', async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const gangs = await Gang.find()
    .select('name description members leader')
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
  res.json(gangs);
});

// POST /gangs – create new gang (auth)
router.post('/gangs', auth, async (req, res) => {
  const { name, description = '' } = req.body;
  if (!name) return res.status(400).json({ message: 'Name required' });

  // ensure user not already in gang
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

// GET /gangs/:id – gang details
router.get('/gangs/:id', async (req, res) => {
  const gang = await Gang.findById(req.params.id)
    .populate('leader', 'username level')
    .populate('members', 'username level')
    .lean();
  if (!gang) return res.status(404).json({ message: 'Not found' });
  res.json(gang);
});

// POST /gangs/:id/join – request to join gang
router.post('/gangs/:id/join', auth, async (req, res) => {
  const gang = await Gang.findById(req.params.id);
  if (!gang) return res.status(404).json({ message: 'Not found' });
  const charId = req.user.id;
  if (gang.members.includes(charId))
    return res.status(400).json({ message: 'Already a member' });
  // Simple auto‑join; later add approvals
  gang.members.push(charId);
  await gang.save();
  res.json({ message: 'Joined gang' });
});

// POST /gangs/:id/leave – leave gang
router.post('/gangs/:id/leave', auth, async (req, res) => {
  const gang = await Gang.findById(req.params.id);
  if (!gang) return res.status(404).json({ message: 'Not found' });
  const charId = req.user.id;
  if (!gang.members.includes(charId))
    return res.status(400).json({ message: 'Not a member' });

  // If leader leaves, transfer or disband (simple disband here)
  if (gang.leader.equals(charId)) {
    await gang.deleteOne();
    return res.json({ message: 'Gang disbanded' });
  }
  gang.members = gang.members.filter((m) => !m.equals(charId));
  await gang.save();
  res.json({ message: 'Left gang' });
});

// GET /my-gang – gang of current player
router.get('/my-gang', auth, async (req, res) => {
  const gang = await Gang.findOne({ members: req.user.id })
    .populate('leader', 'username level')
    .populate('members', 'username level');
  if (!gang) return res.status(204).end();
  res.json(gang);
});

export default router;