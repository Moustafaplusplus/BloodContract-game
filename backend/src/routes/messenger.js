import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import auth from '../middlewares/auth.js';
import Message from '../models/message.js';

const router = Router();
router.use(auth);

/* GET /api/messenger/:id */
router.get('/:id', async (req, res, next) => {
  try {
    const me   = req.user._id;          // set by auth middleware
    const peer = req.params.id;
    const thread = await Message.find({
      $or: [
        { senderId: me,  receiverId: peer },
        { senderId: peer, receiverId: me },
      ],
    })
      .sort({ createdAt: 1 })
      .lean();
    res.json(
      thread.map((m) => ({ ...m, isMine: m.senderId.toString() === me.toString() }))
    );
  } catch (e) {
    next(e);
  }
});

/* POST /api/messenger/:id  – send a DM */
router.post('/:id',
  rateLimit({ windowMs: 30_000, max: 20 }),
  async (req, res, next) => {
    try {
      const me   = req.user._id;
      const peer = req.params.id;
      const msg  = await Message.create({
        senderId: me,
        receiverId: peer,
        content: req.body.content,
      });

      /* WS broadcast */
      req.app.get('io')?.to(peer).emit('dm', { ...msg.toObject(), isMine: false });

      res.status(201).json({ ...msg.toObject(), isMine: true });
    } catch (e) {
      next(e);
    }
  }
);

export default router;
