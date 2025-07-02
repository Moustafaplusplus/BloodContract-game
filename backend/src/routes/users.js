// backend/routes/users.js
import express from 'express';
import User from '../models/user.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'stats'],
      limit: 50
    });
    res.json(users);
  } catch (err) {
    console.error('Error loading users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;
