// backend/src/routes/events.js
import express from 'express';
import Event from '../models/event.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { after } = req.query;

    const filter = after ? { createdAt: { $gt: new Date(Number(after)) } } : {};

    const events = await Event.find(filter)
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(events);
  } catch (err) {
    console.error('GET /api/events failed', err);
    res.sendStatus(500);
  }
});

export default router;
