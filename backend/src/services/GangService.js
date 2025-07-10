import { Gang, GangMember, GangWar } from '../models/Gang.js';
import { User } from '../models/User.js';
import { Character } from '../models/Character.js';
import { Op } from 'sequelize';

export class GangService {
  // Create a new gang
  static async createGang(name, description, leaderId) {
    // Check if user is already in a gang
    const existingMember = await GangMember.findOne({
      where: { userId: leaderId }
    });

    if (existingMember) {
      throw new Error('User is already in a gang');
    }

    // Check if gang name is taken
    const existingGang = await Gang.findOne({
      where: { name }
    });

    if (existingGang) {
      throw new Error('Gang name already taken');
    }

    const gang = await Gang.create({
      name,
      description,
      leaderId
    });

    // Add leader as member
    await GangMember.create({
      gangId: gang.id,
      userId: leaderId,
      role: 'LEADER'
    });

    return gang;
  }

  // Get gang by ID
  static async getGangById(gangId) {
    return await Gang.findByPk(gangId, {
      include: [
        {
          model: GangMember,
          include: [
            { model: User, attributes: ['id', 'username'] }
          ]
        }
      ]
    });
  }

  // Get user's gang
  static async getUserGang(userId) {
    const member = await GangMember.findOne({
      where: { userId },
      include: [
        {
          model: Gang,
          include: [
            {
              model: GangMember,
              include: [
                { model: User, attributes: ['id', 'username'] }
              ]
            }
          ]
        }
      ]
    });

    return member?.Gang || null;
  }

  // Get all gangs
  static async getAllGangs() {
    return await Gang.findAll({
      include: [
        {
          model: GangMember,
          include: [
            { model: User, attributes: ['id', 'username'] }
          ]
        }
      ],
      order: [['level', 'DESC'], ['exp', 'DESC']]
    });
  }

  // Send join request
  static async sendJoinRequest(gangId, userId) {
    // Check if user is already in a gang
    const existingMember = await GangMember.findOne({
      where: { userId }
    });

    if (existingMember) {
      throw new Error('User is already in a gang');
    }

    // Check if gang exists and has space
    const gang = await Gang.findByPk(gangId);
    if (!gang) {
      throw new Error('Gang not found');
    }

    const memberCount = await GangMember.count({
      where: { gangId }
    });

    if (memberCount >= gang.maxMembers) {
      throw new Error('Gang is full');
    }

    // For now, auto-accept join requests
    return await GangMember.create({
      gangId,
      userId,
      role: 'MEMBER'
    });
  }

  // Leave gang
  static async leaveGang(userId) {
    const member = await GangMember.findOne({
      where: { userId }
    });

    if (!member) {
      throw new Error('User is not in a gang');
    }

    if (member.role === 'LEADER') {
      throw new Error('Leader cannot leave gang. Transfer leadership first.');
    }

    await member.destroy();
    return { message: 'Left gang successfully' };
  }

  // Transfer leadership
  static async transferLeadership(gangId, newLeaderId, currentLeaderId) {
    const gang = await Gang.findByPk(gangId);
    if (!gang || gang.leaderId !== currentLeaderId) {
      throw new Error('Not authorized');
    }

    const newLeaderMember = await GangMember.findOne({
      where: { gangId, userId: newLeaderId }
    });

    if (!newLeaderMember) {
      throw new Error('New leader is not a member of this gang');
    }

    // Update gang leader
    gang.leaderId = newLeaderId;
    await gang.save();

    // Update member roles
    await GangMember.update(
      { role: 'MEMBER' },
      { where: { gangId, role: 'LEADER' } }
    );

    newLeaderMember.role = 'LEADER';
    await newLeaderMember.save();

    return gang;
  }

  // Contribute money to gang
  static async contributeMoney(gangId, userId, amount) {
    const member = await GangMember.findOne({
      where: { gangId, userId }
    });

    if (!member) {
      throw new Error('Not a member of this gang');
    }

    const character = await Character.findOne({
      where: { userId }
    });

    if (character.money < amount) {
      throw new Error('Not enough money');
    }

    const gang = await Gang.findByPk(gangId);
    gang.money += amount;
    await gang.save();

    character.money -= amount;
    await character.save();

    return { gangMoney: gang.money, characterMoney: character.money };
  }

  // Get gang wars
  static async getGangWars(gangId) {
    return await GangWar.findAll({
      where: {
        [Op.or]: [
          { gang1Id: gangId },
          { gang2Id: gangId }
        ]
      },
      include: [
        { model: Gang, as: 'Gang1' },
        { model: Gang, as: 'Gang2' }
      ],
      order: [['startTime', 'DESC']]
    });
  }

  // Start gang war
  static async startGangWar(gang1Id, gang2Id, duration = 24) {
    // Check if gangs exist
    const [gang1, gang2] = await Promise.all([
      Gang.findByPk(gang1Id),
      Gang.findByPk(gang2Id)
    ]);

    if (!gang1 || !gang2) {
      throw new Error('One or both gangs not found');
    }

    // Check if there's already an active war
    const activeWar = await GangWar.findOne({
      where: {
        [Op.or]: [
          { gang1Id: gang1Id, status: 'ACTIVE' },
          { gang2Id: gang1Id, status: 'ACTIVE' },
          { gang1Id: gang2Id, status: 'ACTIVE' },
          { gang2Id: gang2Id, status: 'ACTIVE' }
        ]
      }
    });

    if (activeWar) {
      throw new Error('One or both gangs are already in a war');
    }

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000);

    return await GangWar.create({
      gang1Id,
      gang2Id,
      startTime,
      endTime
    });
  }
} 