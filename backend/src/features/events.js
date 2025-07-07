// =======================================================
//  backend/src/features/events.js
//  Features:
//    • Sequelize Event model
//    • /api/events route with pagination & type filter
//    • /api/events (POST) to publish new events
//    • Socket.IO broadcast on publish
// =======================================================

import { Model, DataTypes, Op } from 'sequelize';
import express from 'express';
import { sequelize } from '../config/db.js';
import { auth } from '../features/user.js';
import { io } from '../socket.js'; // <- assumed Socket.IO instance

/* =====================================================================
 * 1) Sequelize model
 * =====================================================================*/
export class Event extends Model {}

Event.init(
  {
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Event',
    tableName: 'Events',
    timestamps: false,
  }
);

/* =====================================================================
 * 2) Express router (/api/events)
 * =====================================================================*/
export const eventRouter = express.Router();

/* ────────────────────────────────────────────────────────────────────
 * GET  /api/events
 *   ?after=<epochMs>   – return events created after timestamp
 *   ?type=<string>     – filter by event type
 *   ?page=<n>          – 1-based page index (default 1)
 *   ?limit=<n>         – items per page (default 50, max 100)
 * ─────────────────────────────────────────────────────────────────── */
eventRouter.get('/', async (req, res) => {
  try {
    const { after, type, page = 1, limit = 50 } = req.query;

    const where = {};
    if (after) where.createdAt = { [Op.gt]: new Date(Number(after)) };
    if (type)  where.type = type;

    const safeLimit  = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
    const safePage   = Math.max(parseInt(page, 10) || 1, 1);
    const offset     = (safePage - 1) * safeLimit;

    const events = await Event.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: safeLimit,
      offset,
    });

    res.json({ events, page: safePage, limit: safeLimit });
  } catch (err) {
    console.error('GET /api/events failed', err);
    res.sendStatus(500);
  }
});

/* ────────────────────────────────────────────────────────────────────
 * POST /api/events  (auth-protected, e.g. admin)
 *   { type: string, text: string }
 *   – creates event, broadcasts via Socket.IO
 * ─────────────────────────────────────────────────────────────────── */
eventRouter.post('/', auth, async (req, res) => {
  const { type, text } = req.body;
  if (!type || !text) return res.status(400).json({ message: 'type and text required' });

  try {
    const evt = await Event.create({ type, text });

    // broadcast to all connected clients
    if (io) io.emit('event', evt.toJSON());

    res.status(201).json(evt);
  } catch (err) {
    console.error('POST /api/events failed', err);
    res.sendStatus(500);
  }
});

/* =====================================================================
 * 3) Barrel exports
 * =====================================================================*/
export default {
  Event,
  eventRouter,
};