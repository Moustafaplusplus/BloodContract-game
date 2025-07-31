
import express from 'express';
const router = express.Router();
import { auth } from '../middleware/auth.js';
import { checkConfinementAccess } from '../middleware/confinement.js';
import { User, BloodContract } from '../models/index.js';
import { Op } from 'sequelize';
import { Character } from '../models/Character.js';
import { FightService } from '../services/FightService.js';
import { sequelize } from '../config/db.js';
import { Hospital } from '../models/Confinement.js';
import { BlackcoinTransaction } from '../models/Blackcoin.js';
import { Statistic } from '../models/Statistic.js';
import { NotificationService } from '../services/NotificationService.js';
import { emitNotification } from '../socket.js';
// Ghost Assassin: Instantly hospitalize a target for 5 black coins
router.post('/ghost-assassin', auth, checkConfinementAccess, async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userId = req.user.id;
    const { targetId } = req.body;
    if (!targetId) {
      await t.rollback();
      return res.status(400).json({ message: 'Target ID is required.' });
    }
    if (Number(targetId) === Number(userId)) {
      await t.rollback();
      return res.status(400).json({ message: 'You cannot target yourself.' });
    }
    // Use Character for blackcoins
    const character = await Character.findOne({ where: { userId }, transaction: t, lock: t.LOCK.UPDATE });
    if (!character || character.blackcoins < 5) {
      await t.rollback();
      return res.status(400).json({ message: 'Insufficient black coins.' });
    }
    const target = await User.findByPk(targetId);
    if (!target) {
      await t.rollback();
      return res.status(404).json({ message: 'Target user not found.' });
    }
    // Deduct black coins from character
    character.blackcoins -= 5;
    await character.save({ transaction: t });
    await BlackcoinTransaction.create({
      userId,
      amount: -5,
      type: 'SPEND',
      description: 'Hired Ghost Assassin',
    }, { transaction: t });
    // Put target in hospital for 30 minutes
    const now = new Date();
    const minutes = 30;
    const releasedAt = new Date(now.getTime() + minutes * 60000);
    await Hospital.create({
      userId: targetId,
      minutes,
      hpLoss: 100, // Fixed HP loss
      healRate: 200, // Not used anymore but kept for compatibility
      startedAt: now,
      releasedAt,
      crimeId: null,
    }, { transaction: t });
    // Increment assassinations for the target
    let stat = await Statistic.findOne({ where: { userId: targetId }, transaction: t, lock: t.LOCK.UPDATE });
    if (!stat) {
      stat = await Statistic.create({ userId: targetId }, { transaction: t });
    }
    stat.assassinations = (stat.assassinations || 0) + 1;
    await stat.save({ transaction: t });
    await t.commit();
    
    // Send notification to target about Ghost Assassin
    try {
      const ghostNotification = await NotificationService.createGhostAssassinatedNotification(targetId);
      emitNotification(targetId, ghostNotification);
      console.log('[Ghost Assassin] Notification sent to target:', targetId);
    } catch (notificationError) {
      console.error('[Ghost Assassin] Notification error:', notificationError);
    }
    
    // Dramatic narrative
    const narrative = `In the dead of night, a shadowy figure known only as the Ghost Assassin silently crept through the city. With a single, swift strike, your target was found lifeless and rushed to the hospital. No one saw the killer—only the chilling aftermath remains.`;
    res.json({ success: true, narrative, targetId });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: 'Failed to hire Ghost Assassin.', error: err.message });
  }
});

// Create a new blood contract
router.post('/', auth, checkConfinementAccess, async (req, res) => {
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
    
    // Check if target has attack immunity
    const targetCharacter = await Character.findOne({ where: { userId: targetId } });
    if (targetCharacter && targetCharacter.attackImmunityExpiresAt && new Date(targetCharacter.attackImmunityExpiresAt) > new Date()) {
      // Get poster's name for notification
      const posterCharacter = await Character.findOne({ where: { userId: posterId } });
      const posterName = posterCharacter?.name || req.user.username || 'Unknown';
      
      // Send notification to the protected player
      try {
        const protectionNotification = await NotificationService.createAttackImmunityProtectedNotification(targetId, 'blood_contract', posterName);
        emitNotification(targetId, protectionNotification);
        console.log('[Blood Contract] Protection notification sent to target:', targetId);
      } catch (notificationError) {
        console.error('[Blood Contract] Protection notification error:', notificationError);
      }
      return res.status(400).json({ message: 'لا يمكن وضع عقد دم على هذا اللاعب لأنه محمي من الهجمات حالياً.' });
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
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
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
    // Expire contracts past their expiration and send notifications
    const expiredContracts = await BloodContract.findAll({
      where: { 
        status: 'open', 
        expiresAt: { [Op.lte]: now } 
      },
      include: [
        {
          model: User,
          as: 'target',
          attributes: ['id', 'username']
        }
      ]
    });
    
    if (expiredContracts.length > 0) {
      // Mark contracts as expired
      await BloodContract.update(
        { status: 'expired' },
        { where: { status: 'open', expiresAt: { [Op.lte]: now } } }
      );
      
      // Send notifications for expired contracts
      for (const contract of expiredContracts) {
        try {
          const targetCharacter = await Character.findOne({ where: { userId: contract.targetId } });
          const targetName = targetCharacter?.name || targetCharacter?.username || 'Unknown';
          const expirationNotification = await NotificationService.createContractExpiredNotification(
            contract.posterId, 
            targetName
          );
          emitNotification(contract.posterId, expirationNotification);
          console.log('[Contract Expiration] Notification sent to poster:', contract.posterId);
        } catch (notificationError) {
          console.error('[Contract Listing] Expiration notification error:', notificationError);
        }
      }
    }
    // Show all contracts where user is poster, or can fulfill (not target)
    const contracts = await BloodContract.findAll({
      where: {
        status: 'open',
        expiresAt: { [Op.gt]: now },
        [Op.or]: [
          { posterId: userId },
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
          name: contract.target?.Character?.name || contract.target?.username,
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
  const t = await sequelize.transaction();
  try {
    const userId = req.user.id;
    const contract = await BloodContract.findByPk(req.params.id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!contract) {
      await t.rollback();
      return res.status(404).json({ message: 'Contract not found.' });
    }
    if (contract.status !== 'open') {
      await t.rollback();
      return res.status(400).json({ message: 'Contract is not open.' });
    }
    if (new Date(contract.expiresAt) <= new Date()) {
      contract.status = 'expired';
      await contract.save({ transaction: t });
      await t.commit();
      return res.status(400).json({ message: 'Contract has expired.' });
    }
    if (userId === contract.posterId || userId === contract.targetId) {
      await t.rollback();
      return res.status(403).json({ message: 'You cannot fulfill your own contract or target yourself.' });
    }
    if (contract.assassinId) {
      await t.rollback();
      return res.status(400).json({ message: 'Contract already fulfilled.' });
    }
    
    // Check if target has attack immunity
    const targetCharacter = await Character.findOne({ where: { userId: contract.targetId }, transaction: t });
    if (targetCharacter && targetCharacter.attackImmunityExpiresAt && new Date(targetCharacter.attackImmunityExpiresAt) > new Date()) {
      // Get assassin's name for notification
      const assassinCharacter = await Character.findOne({ where: { userId }, transaction: t });
      const assassinName = assassinCharacter?.name || 'Unknown';
      
      // Send notification to the protected player
      try {
        const protectionNotification = await NotificationService.createAttackImmunityProtectedNotification(contract.targetId, 'blood_contract', assassinName);
        emitNotification(contract.targetId, protectionNotification);
        console.log('[Blood Contract] Protection notification sent to target:', contract.targetId);
      } catch (notificationError) {
        console.error('[Blood Contract] Protection notification error:', notificationError);
      }
      await t.rollback();
      return res.status(400).json({ message: 'لا يمكن تنفيذ العقد لأن الهدف محمي من الهجمات حالياً.' });
    }
    
    // Run real fight using FightService (handles confinement automatically)
    const fightResult = await FightService.runContractFight(userId, contract.targetId);
    // Save fight log to contract
    contract.fightLog = JSON.stringify(fightResult.log);
    contract.fightResult = JSON.stringify(fightResult);
    
    // Get target character for notifications (reuse the one we already fetched)
    const targetName = targetCharacter?.name || targetCharacter?.username || 'Unknown';
    
    // If assassin wins (target goes to hospital for 30 minutes)
    if (fightResult.winner.userId === userId) {
      contract.status = 'fulfilled';
      contract.assassinId = userId;
      contract.fulfilledAt = new Date();
      // Pay reward
      const assassinCharacter = await Character.findOne({ where: { userId }, transaction: t, lock: t.LOCK.UPDATE });
      if (assassinCharacter) {
        assassinCharacter.money += contract.price;
        await assassinCharacter.save({ transaction: t });
      }
      // Increment assassinations for the target
      let stat2 = await Statistic.findOne({ where: { userId: contract.targetId }, transaction: t, lock: t.LOCK.UPDATE });
      if (!stat2) {
        stat2 = await Statistic.create({ userId: contract.targetId }, { transaction: t });
      }
      stat2.assassinations = (stat2.assassinations || 0) + 1;
      await stat2.save({ transaction: t });
      await contract.save({ transaction: t });
      await t.commit();
      
      // Send notifications
      try {
        // Notify poster about successful contract execution
        const posterNotification = await NotificationService.createContractAttemptedNotification(contract.posterId, targetName, true);
        emitNotification(contract.posterId, posterNotification);
        console.log('[Contract Success] Poster notification sent:', contract.posterId);
        
        // Notify target about being assassinated (without mentioning assassin name)
        const targetNotification = await NotificationService.createContractTargetAssassinatedNotification(contract.targetId);
        emitNotification(contract.targetId, targetNotification);
        console.log('[Contract Success] Target notification sent:', contract.targetId);
        
        // Notify assassin about successful contract execution
        const assassinCharacter = await Character.findOne({ where: { userId } });
        const assassinName = assassinCharacter?.name || 'Unknown';
        const assassinNotification = await NotificationService.createContractExecutedNotification(userId, targetName, contract.price);
        emitNotification(userId, assassinNotification);
        console.log('[Contract Success] Assassin notification sent:', userId);
      } catch (notificationError) {
        console.error('[Contract Success] Notification error:', notificationError);
      }
      
      return res.json({ 
        success: true, 
        message: 'Contract fulfilled! Target has been hospitalized for 30 minutes.', 
        contractId: contract.id, 
        fightResult 
      });
    } else {
      // If failed, assassin goes to jail for 30 minutes (handled by FightService)
      await contract.save({ transaction: t });
      await t.commit();
      
      // Send notifications
      try {
        // Notify poster about failed contract attempt
        const posterNotification = await NotificationService.createContractAttemptedNotification(contract.posterId, targetName, false);
        emitNotification(contract.posterId, posterNotification);
        console.log('[Contract Failure] Poster notification sent:', contract.posterId);
        
        // Notify target about failed assassination attempt
        const targetNotification = await NotificationService.createAttackNotification(contract.targetId, 'Unknown Assassin', 0);
        emitNotification(contract.targetId, targetNotification);
        console.log('[Contract Failure] Target notification sent:', contract.targetId);
      } catch (notificationError) {
        console.error('[Contract Failure] Notification error:', notificationError);
      }
      
      return res.json({ 
        success: false, 
        message: 'Attack failed. You have been jailed for 30 minutes for your failed attempt.', 
        fightResult 
      });
    }
  } catch (err) {
    console.error('Error fulfilling contract:', err);
    await t.rollback();
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