// backend/src/services/friendService.js
// -------------------------------------
// This file uses ES-module syntax because your project’s package.json
// has `"type": "module"`.

import User from '../models/user.js';
import Friendship from '../models/friendship.js';
import { Op } from 'sequelize';

/**
 * Send a friend request from the logged-in user to :userId
 */
export async function sendRequest(req, res) {
  const requesterId = req.user.id;               // set by auth middleware
  const addresseeId = parseInt(req.params.userId, 10);

  if (requesterId === addresseeId) {
    return res.status(400).json({ msg: 'Cannot friend yourself' });
  }

  // prevent duplicates
  const exists = await Friendship.findOne({
    where: { requesterId, addresseeId }
  });
  if (exists) {
    return res.status(409).json({ msg: 'Already requested' });
  }

  const friendship = await Friendship.create({ requesterId, addresseeId });
  return res.json(friendship);
}

/**
 * Accept a pending friend request sent by :userId
 */
export async function accept(req, res) {
  const addresseeId = req.user.id;
  const requesterId = parseInt(req.params.userId, 10);

  const friendship = await Friendship.findOne({
    where: { requesterId, addresseeId, status: 'pending' }
  });

  if (!friendship) {
    return res.status(404).json({ msg: 'No pending request' });
  }

  friendship.status = 'accepted';
  await friendship.save();
  return res.json(friendship);
}

/**
 * Remove (unfriend) the relationship between the logged-in user and :userId
 */
export async function remove(req, res) {
  const userId   = req.user.id;
  const friendId = parseInt(req.params.userId, 10);

  await Friendship.destroy({
    where: {
      status: 'accepted',
      [Op.or]: [
        { requesterId: userId,  addresseeId: friendId },
        { requesterId: friendId, addresseeId: userId }
      ]
    }
  });

  return res.json({ msg: 'removed' });
}

/**
 * List all accepted friends for the logged-in user
 */
export async function list(req, res) {
  const userId = req.user.id;

  const friendships = await Friendship.findAll({
    where: {
      status: 'accepted',
      [Op.or]: [
        { requesterId: userId },
        { addresseeId: userId }
      ]
    },
    include: [
      { model: User, as: 'Requestees', attributes: ['id', 'username'] },
      { model: User, as: 'Requesters', attributes: ['id', 'username'] }
    ]
  });

  // Flatten to a simple array of friend-user objects
  const friends = friendships.map(f =>
    f.requesterId === userId ? f.Requestees[0] : f.Requesters[0]
  );

  return res.json(friends);
}


