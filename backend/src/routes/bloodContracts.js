import express from 'express';
import { auth } from '../middleware/auth.js';
import { User, BloodContract } from '../models/index.js';
import { Op } from 'sequelize';
import { Character } from '../models/Character.js';
import { FightService } from '../services/FightService.js';

const router = express.Router();

// Create a new blood contract
router.post('/', auth, async (req, res) => {
  try {
    const posterId = req.user.id;
    const { targetId, price } = req.body;
    if (!targetId || !price) {
      return res.status(400).json({ message: 'Target and price are required.' });
    }
    if (Number(targetId) === Number(posterId)) {
      return res.status(400).json({ message: 'You cannot target yourself.' });
    }
    if (isNaN(price) || Number(price) <= 0) {
      return res.status(400).json({ message: 'Price must be a positive number.' });
    }
    // Check if target exists
    const targetUser = await User.findByPk(targetId);
    if (!targetUser) {
      return res.status(404).json({ message: 'Target user not found.' });
    }
    // Check poster's money (use Character.money, not User.money)
    const posterCharacter = await Character.findOne({ where: { userId: posterId } });
    const priceInt = Number(price);
    if (!posterCharacter || posterCharacter.money < priceInt) {
      return res.status(400).json({ message: 'Insufficient funds.' });
    }
    // Deduct money
    posterCharacter.money -= priceInt;
    await posterCharacter.save();
    // Create contract
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours from now
    const contract = await BloodContract.create({
      posterId,
      targetId,
      price,
      expiresAt,
      status: 'open',
    });
    res.status(201).json({ contract });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create contract.', error: err.message });
  }
});

// List available contracts (with visibility and canFulfill flag)
router.get('/available', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    // Expire contracts past their expiration
    await BloodContract.update(
      { status: 'expired' },
      { where: { status: 'open', expiresAt: { [Op.lte]: now } } }
    );
    // Show all contracts where user is poster, target, or can fulfill
    const contracts = await BloodContract.findAll({
      where: {
        status: 'open',
        expiresAt: { [Op.gt]: now },
        [Op.or]: [
          { posterId: userId },
          { targetId: userId },
          { posterId: { [Op.ne]: userId }, targetId: { [Op.ne]: userId } },
        ],
      },
      include: [
        {
          model: User,
          as: 'target',
          attributes: ['id', 'username'],
          include: [
            {
              model: Character,
              attributes: ['level', 'name', 'userId'],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    // Format response: exclude posterId, include target info, add canFulfill
    const result = await Promise.all(contracts.map(async contract => {
      let fame = null;
      let canFulfill = true;
      if (contract.target && contract.target.Character) {
        fame = await contract.target.Character.getFame();
      }
      if (userId === contract.posterId || userId === contract.targetId) {
        canFulfill = false;
      }
      return {
        id: contract.id,
        target: {
          id: contract.target?.id,
          username: contract.target?.username,
          fame,
          level: contract.target?.Character?.level,
          name: contract.target?.Character?.name,
        },
        price: contract.price,
        status: contract.status,
        createdAt: contract.createdAt,
        expiresAt: contract.expiresAt,
        isPoster: userId === contract.posterId,
        isTarget: userId === contract.targetId,
        canFulfill,
      };
    }));
    res.json({ contracts: result });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch contracts.', error: err.message });
  }
});

// Fulfill a contract (attack/assassination)
router.post('/:id/accept', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const contract = await BloodContract.findByPk(req.params.id);
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found.' });
    }
    if (contract.status !== 'open') {
      return res.status(400).json({ message: 'Contract is not open.' });
    }
    if (new Date(contract.expiresAt) <= new Date()) {
      contract.status = 'expired';
      await contract.save();
      return res.status(400).json({ message: 'Contract has expired.' });
    }
    if (userId === contract.posterId || userId === contract.targetId) {
      return res.status(403).json({ message: 'You cannot fulfill your own contract or target yourself.' });
    }
    if (contract.assassinId) {
      return res.status(400).json({ message: 'Contract already fulfilled.' });
    }
    // Run real fight using FightService
    const fightResult = await FightService.runFight(userId, contract.targetId);
    // Save fight log to contract
    contract.fightLog = JSON.stringify(fightResult.log);
    contract.fightResult = JSON.stringify(fightResult);
    // If assassin wins
    if (fightResult.winner.userId === userId) {
      contract.status = 'fulfilled';
      contract.assassinId = userId;
      contract.fulfilledAt = new Date();
      // Pay reward
      const assassinCharacter = await Character.findOne({ where: { userId } });
      if (assassinCharacter) {
        assassinCharacter.money += contract.price;
        await assassinCharacter.save();
      }
      await contract.save();
      return res.json({ success: true, message: 'Contract fulfilled!', contractId: contract.id, fightResult });
    } else {
      // If failed, contract remains open
      await contract.save();
      return res.json({ success: false, message: 'Attack failed. Try again later.', fightResult });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to fulfill contract.', error: err.message });
  }
});

// Get reward info after fulfillment
router.get('/:id/reward', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const contract = await BloodContract.findByPk(req.params.id, {
      include: [
        { model: User, as: 'poster', attributes: ['id', 'username'] },
      ],
    });
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found.' });
    }
    if (contract.status !== 'fulfilled') {
      return res.status(400).json({ message: 'Contract not fulfilled yet.' });
    }
    if (contract.assassinId !== userId) {
      return res.status(403).json({ message: 'You are not the assassin for this contract.' });
    }
    res.json({
      reward: contract.price,
      poster: contract.poster,
      fulfilledAt: contract.fulfilledAt,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get reward info.', error: err.message });
  }
});

// Get fight result/log for a contract
router.get('/:id/result', auth, async (req, res) => {
  try {
    const contract = await BloodContract.findByPk(req.params.id);
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found.' });
    }
    if (!contract.fightResult) {
      return res.status(404).json({ message: 'No fight result found for this contract.' });
    }
    res.json({ fightResult: JSON.parse(contract.fightResult) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get fight result.', error: err.message });
  }
});

export default router; 