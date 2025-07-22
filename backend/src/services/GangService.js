import { Gang, GangMember, GangJoinRequest } from '../models/Gang.js';
import { User } from '../models/User.js';
import { Character } from '../models/Character.js';
import { Op } from 'sequelize';

export class GangService {
  // Create a new gang
  static async createGang(name, description, leaderId, method) {
    // Check if user is already in a gang
    const existingMember = await GangMember.findOne({ where: { userId: leaderId } });
    if (existingMember) throw new Error('User is already in a gang');

    // Check if gang name is taken
    const existingGang = await Gang.findOne({ where: { name } });
    if (existingGang) throw new Error('Gang name already taken');

    // Payment logic
    const user = await User.findByPk(leaderId);
    if (!user) throw new Error('User not found');
    const character = await Character.findOne({ where: { userId: leaderId } });
    if (!character) throw new Error('Character not found');

    if (method === 'vip') {
      if (!character.isVip()) throw new Error('You must be VIP to use this method');
      if (character.money < 100000) throw new Error('Not enough money (VIP)');
      character.money -= 100000;
      await character.save();
    } else if (method === 'blackcoins') {
      if (character.blackcoins < 30) throw new Error('Not enough black coins');
      character.blackcoins -= 30;
      await character.save();
    } else {
      throw new Error('Invalid payment method');
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
    const gang = await Gang.findByPk(gangId, {
      include: [
        {
          model: GangMember,
          include: [
            { 
              model: User, 
              attributes: ['id', 'username']
            }
          ]
        }
      ]
    });

    // Manually add Character data for each member
    if (gang && gang.GangMembers) {
      for (const member of gang.GangMembers) {
        const character = await Character.findOne({
          where: { userId: member.User.id },
          attributes: ['id', 'level', 'strength', 'defense', 'hp', 'maxHp']
        });
        // Convert to plain object to ensure it's included in JSON
        member.User.dataValues.Character = character ? character.toJSON() : null;
      }
    }

    return gang;
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
                { 
                  model: User, 
                  attributes: ['id', 'username']
                }
              ]
            }
          ]
        }
      ]
    });

    // Manually add Character data for each member
    if (member?.Gang && member.Gang.GangMembers) {
      for (const gangMember of member.Gang.GangMembers) {
        const character = await Character.findOne({
          where: { userId: gangMember.User.id },
          attributes: ['id', 'level', 'strength', 'defense', 'hp', 'maxHp']
        });
        // Convert to plain object to ensure it's included in JSON
        gangMember.User.dataValues.Character = character ? character.toJSON() : null;
      }
    }

    return member?.Gang || null;
  }

  // Get all gangs
  static async getAllGangs() {
    const gangs = await Gang.findAll({
      include: [
        {
          model: GangMember,
          include: [
            { 
              model: User, 
              attributes: ['id', 'username']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Manually add Character data for each member in each gang
    for (const gang of gangs) {
      if (gang.GangMembers) {
        for (const member of gang.GangMembers) {
          const character = await Character.findOne({
            where: { userId: member.User.id },
            attributes: ['id', 'level', 'strength', 'defense', 'hp', 'maxHp']
          });
          // Convert to plain object to ensure it's included in JSON
          member.User.dataValues.Character = character ? character.toJSON() : null;
        }
      }
    }

    return gangs;
  }

  // Send join request
  static async sendJoinRequest(gangId, userId, message = '') {
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

    // Check if there's already a pending request
    const existingRequest = await GangJoinRequest.findOne({
      where: { gangId, userId, status: 'PENDING' }
    });

    if (existingRequest) {
      throw new Error('You already have a pending join request for this gang');
    }

    // Create a pending join request
    return await GangJoinRequest.create({
      gangId,
      userId,
      message
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



  // Update gang board (admin/owner only)
  static async updateBoard(gangId, userId, board) {
    const member = await GangMember.findOne({
      where: { gangId, userId }
    });

    if (!member) {
      throw new Error('Not a member of this gang');
    }

    if (member.role !== 'LEADER' && member.role !== 'OFFICER') {
      throw new Error('Not authorized');
    }

    const gang = await Gang.findByPk(gangId);
    if (!gang) {
      throw new Error('Gang not found');
    }

    gang.board = board;
    await gang.save();

    return { board: gang.board };
  }



  // Get gang vault
  static async getVault(gangId) {
    const gang = await Gang.findByPk(gangId);
    if (!gang) {
      throw new Error('Gang not found');
    }

    return gang.money;
  }

  // Update gang vault (admin/owner only)
  static async updateVault(gangId, userId, money) {
    const member = await GangMember.findOne({
      where: { gangId, userId }
    });

    if (!member) {
      throw new Error('Not a member of this gang');
    }

    if (member.role !== 'LEADER' && member.role !== 'OFFICER') {
      throw new Error('Not authorized');
    }

    const gang = await Gang.findByPk(gangId);
    if (!gang) {
      throw new Error('Gang not found');
    }

    gang.money = money;
    await gang.save();

    return { vault: gang.money };
  }

  // Transfer money from gang vault to a member (owner only)
  static async transferFromVault(gangId, ownerId, memberId, amount) {
    const gang = await Gang.findByPk(gangId);
    if (!gang) throw new Error('Gang not found');
    if (gang.leaderId !== ownerId) throw new Error('Not authorized');
    if (gang.money < amount) throw new Error('Not enough money in vault');
    const member = await GangMember.findOne({ where: { gangId, userId: memberId } });
    if (!member) throw new Error('Target user is not a member of this gang');
    const character = await Character.findOne({ where: { userId: memberId } });
    if (!character) throw new Error('Character not found');
    gang.money -= amount;
    character.money += amount;
    await gang.save();
    await character.save();
    return { gangMoney: gang.money, memberMoney: character.money };
  }

  // Delete a gang (owner only)
  static async deleteGang(gangId, userId) {
    const gang = await Gang.findByPk(gangId);
    if (!gang) throw new Error('Gang not found');
    if (gang.leaderId !== userId) throw new Error('Not authorized');
    // Delete all members
    await GangMember.destroy({ where: { gangId } });

    // Delete the gang
    await gang.destroy();
    return { message: 'Gang deleted successfully' };
  }

  // Kick a member (leader/officer only)
  static async kickMember(gangId, kickerId, targetUserId) {
    const kickerMember = await GangMember.findOne({
      where: { gangId, userId: kickerId }
    });
    if (!kickerMember) throw new Error('Not a member of this gang');
    if (kickerMember.role !== 'LEADER' && kickerMember.role !== 'OFFICER') {
      throw new Error('Not authorized to kick members');
    }

    const targetMember = await GangMember.findOne({
      where: { gangId, userId: targetUserId }
    });
    if (!targetMember) throw new Error('Target user is not a member of this gang');
    if (targetMember.role === 'LEADER') throw new Error('Cannot kick the leader');
    if (kickerMember.role === 'OFFICER' && targetMember.role === 'OFFICER') {
      throw new Error('Officers cannot kick other officers');
    }

    await targetMember.destroy();
    return { message: 'Member kicked successfully' };
  }

  // Promote member to officer (leader only)
  static async promoteMember(gangId, leaderId, targetUserId) {
    const leaderMember = await GangMember.findOne({
      where: { gangId, userId: leaderId, role: 'LEADER' }
    });
    if (!leaderMember) throw new Error('Not authorized');

    const targetMember = await GangMember.findOne({
      where: { gangId, userId: targetUserId }
    });
    if (!targetMember) throw new Error('Target user is not a member of this gang');
    if (targetMember.role !== 'MEMBER') throw new Error('Can only promote members to officers');

    targetMember.role = 'OFFICER';
    await targetMember.save();
    return { message: 'Member promoted successfully' };
  }

  // Demote officer to member (leader only)
  static async demoteOfficer(gangId, leaderId, targetUserId) {
    const leaderMember = await GangMember.findOne({
      where: { gangId, userId: leaderId, role: 'LEADER' }
    });
    if (!leaderMember) throw new Error('Not authorized');

    const targetMember = await GangMember.findOne({
      where: { gangId, userId: targetUserId }
    });
    if (!targetMember) throw new Error('Target user is not a member of this gang');
    if (targetMember.role !== 'OFFICER') throw new Error('Can only demote officers');

    targetMember.role = 'MEMBER';
    await targetMember.save();
    return { message: 'Officer demoted successfully' };
  }

  // Get pending join requests for a gang (leader/officer only)
  static async getJoinRequests(gangId, requesterId) {
    const requesterMember = await GangMember.findOne({
      where: { gangId, userId: requesterId }
    });
    if (!requesterMember) throw new Error('Not a member of this gang');
    if (requesterMember.role !== 'LEADER' && requesterMember.role !== 'OFFICER') {
      throw new Error('Not authorized to view join requests');
    }

    return await GangJoinRequest.findAll({
      where: { gangId, status: 'PENDING' },
      include: [
        {
          model: User,
          attributes: ['id', 'username']
        }
      ],
      order: [['createdAt', 'ASC']]
    });
  }

  // Accept join request (leader/officer only)
  static async acceptJoinRequest(gangId, requesterId, requestId) {
    const requesterMember = await GangMember.findOne({
      where: { gangId, userId: requesterId }
    });
    if (!requesterMember) throw new Error('Not a member of this gang');
    if (requesterMember.role !== 'LEADER' && requesterMember.role !== 'OFFICER') {
      throw new Error('Not authorized to accept join requests');
    }

    const joinRequest = await GangJoinRequest.findByPk(requestId);
    if (!joinRequest || joinRequest.gangId !== parseInt(gangId)) {
      throw new Error('Join request not found');
    }
    if (joinRequest.status !== 'PENDING') {
      throw new Error('Join request is not pending');
    }

    // Check if gang still has space
    const gang = await Gang.findByPk(gangId);
    const memberCount = await GangMember.count({ where: { gangId } });
    if (memberCount >= gang.maxMembers) {
      throw new Error('Gang is full');
    }

    // Check if user is still available
    const existingMember = await GangMember.findOne({
      where: { userId: joinRequest.userId }
    });
    if (existingMember) {
      throw new Error('User is already in a gang');
    }

    // Accept the request and add member
    joinRequest.status = 'ACCEPTED';
    await joinRequest.save();

    const newMember = await GangMember.create({
      gangId,
      userId: joinRequest.userId,
      role: 'MEMBER'
    });

    return { message: 'Join request accepted', member: newMember };
  }

  // Reject join request (leader/officer only)
  static async rejectJoinRequest(gangId, requesterId, requestId) {
    const requesterMember = await GangMember.findOne({
      where: { gangId, userId: requesterId }
    });
    if (!requesterMember) throw new Error('Not a member of this gang');
    if (requesterMember.role !== 'LEADER' && requesterMember.role !== 'OFFICER') {
      throw new Error('Not authorized to reject join requests');
    }

    const joinRequest = await GangJoinRequest.findByPk(requestId);
    if (!joinRequest || joinRequest.gangId !== parseInt(gangId)) {
      throw new Error('Join request not found');
    }
    if (joinRequest.status !== 'PENDING') {
      throw new Error('Join request is not pending');
    }

    joinRequest.status = 'REJECTED';
    await joinRequest.save();

    return { message: 'Join request rejected' };
  }

  // Get user's pending join requests
  static async getUserJoinRequests(userId) {
    return await GangJoinRequest.findAll({
      where: { userId, status: 'PENDING' },
      include: [
        {
          model: Gang,
          attributes: ['id', 'name', 'description']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  // Cancel join request
  static async cancelJoinRequest(userId, gangId) {
    const joinRequest = await GangJoinRequest.findOne({
      where: { userId, gangId, status: 'PENDING' }
    });
    
    if (!joinRequest) {
      throw new Error('No pending join request found for this gang');
    }

    await joinRequest.destroy();
    return { message: 'Join request cancelled successfully' };
  }
} 