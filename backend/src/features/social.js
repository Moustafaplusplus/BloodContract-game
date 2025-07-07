// =======================================================
//  backend/src/features/social.js
//  Friends & Direct-Messages re-aligned with new auth layer
// =======================================================

/* ───────── externals ───────── */
import { DataTypes, Op } from 'sequelize';
import mongoose, { Types } from 'mongoose';
import express from 'express';
import rateLimit from 'express-rate-limit';

/* ───────── internals ───────── */
import { sequelize }  from '../config/db.js';
import { User, auth } from './user.js';

/* ╔══════════════════════════════════════════════════════╗
 * 1️⃣  Sequelize Friendship model + associations
 * ╚══════════════════════════════════════════════════════╝ */
export const Friendship = sequelize.define('Friendship', {
  requesterId: { type: DataTypes.INTEGER, allowNull: false },
  addresseeId: { type: DataTypes.INTEGER, allowNull: false },
  status:      { type: DataTypes.ENUM('pending', 'accepted', 'blocked'), defaultValue: 'pending' },
}, { timestamps: false });

Friendship.belongsTo(User, { as: 'Requester', foreignKey: 'requesterId' });
Friendship.belongsTo(User, { as: 'Addressee', foreignKey: 'addresseeId' });
User.hasMany(Friendship,   { as: 'RequestsSent',     foreignKey: 'requesterId' });
User.hasMany(Friendship,   { as: 'RequestsReceived', foreignKey: 'addresseeId' });

/* ╔══════════════════════════════════════════════════════╗
 * 2️⃣  Mongoose Message model
 * ╚══════════════════════════════════════════════════════╝ */
const messageSchema = new mongoose.Schema({
  senderId:   { type: mongoose.Schema.Types.Number, required: true }, // Sequelize userId int
  receiverId: { type: mongoose.Schema.Types.Number, required: true },
  content:    { type: String, trim: true, maxlength: 2000, required: true },
  createdAt:  { type: Date, default: Date.now },
});
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: 1 });
export const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

/* ╔══════════════════════════════════════════════════════╗
 * 3️⃣  Friend service helpers
 * ╚══════════════════════════════════════════════════════╝ */
export const friendService = {
  async sendRequest(req, res) {
    const requesterId = req.user.id;
    const addresseeId = parseInt(req.params.userId, 10);
    if (requesterId === addresseeId) return res.status(400).json({ msg: 'Cannot friend yourself' });

    const dupe = await Friendship.findOne({
      where: {
        [Op.or]: [
          { requesterId, addresseeId },
          { requesterId: addresseeId, addresseeId: requesterId },
        ],
      },
    });
    if (dupe) return res.status(409).json({ msg: 'Request already exists' });

    const friendship = await Friendship.create({ requesterId, addresseeId });
    res.json(friendship);
  },

  async accept(req, res) {
    const addresseeId = req.user.id;
    const requesterId = parseInt(req.params.userId, 10);
    const f = await Friendship.findOne({ where: { requesterId, addresseeId, status: 'pending' } });
    if (!f) return res.status(404).json({ msg: 'No pending request' });
    f.status = 'accepted'; await f.save(); res.json(f);
  },

  async remove(req, res) {
    const userId = req.user.id;
    const friendId = parseInt(req.params.userId, 10);
    await Friendship.destroy({
      where: {
        status: 'accepted',
        [Op.or]: [
          { requesterId: userId, addresseeId: friendId },
          { requesterId: friendId, addresseeId: userId },
        ],
      },
    });
    res.json({ msg: 'removed' });
  },

  async list(req, res) {
    const userId = req.user.id;
    const friendships = await Friendship.findAll({
      where: {
        status: 'accepted',
        [Op.or]: [{ requesterId: userId }, { addresseeId: userId }],
      },
      include: [
        { model: User, as: 'Requester', attributes: ['id', 'username'] },
        { model: User, as: 'Addressee', attributes: ['id', 'username'] },
      ],
    });
    const friends = friendships.map(f => f.requesterId === userId ? f.Addressee : f.Requester);
    res.json(friends);
  },
};

/* ╔══════════════════════════════════════════════════════╗
 * 4️⃣  Routers
 * ╚══════════════════════════════════════════════════════╝ */
export const friendsRouter = express.Router();
export const messengerRouter = express.Router();

// friends endpoints (all auth-protected)
friendsRouter.use(auth);
friendsRouter.get('/', friendService.list);
friendsRouter.post('/:userId', friendService.sendRequest);
friendsRouter.post('/:userId/accept', friendService.accept);
friendsRouter.delete('/:userId', friendService.remove);

// messenger endpoints
messengerRouter.use(auth);

// GET thread
messengerRouter.get('/:id', async (req, res, next) => {
  try {
    const me   = req.user.id;
    const peer = parseInt(req.params.id, 10);
    const thread = await Message.find({
      $or: [ { senderId: me, receiverId: peer }, { senderId: peer, receiverId: me } ],
    }).sort({ createdAt: 1 }).lean();
    res.json(thread.map(m => ({ ...m, isMine: m.senderId === me })));
  } catch (err) { next(err); }
});

// POST message
messengerRouter.post('/:id', rateLimit({ windowMs: 30_000, max: 20 }), async (req,res,next)=>{
  try {
    const me   = req.user.id;
    const peer = parseInt(req.params.id, 10);
    const { content } = req.body;
    if (!content || content.trim().length === 0) return res.status(400).json({ msg:'Empty message' });

    const msg = await Message.create({ senderId: me, receiverId: peer, content: content.trim() });
    req.app.get('io')?.to(String(peer)).emit('dm', { ...msg.toObject(), isMine:false });
    res.status(201).json({ ...msg.toObject(), isMine:true });
  } catch (err) { next(err); }
});

/* ╔══════════════════════════════════════════════════════╗
 * 5️⃣  Barrel export
 * ╚══════════════════════════════════════════════════════╝ */
export default { Friendship, Message, friendsRouter, messengerRouter };