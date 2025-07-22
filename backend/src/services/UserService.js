import { User } from '../models/User.js';
import { Character } from '../models/Character.js';
import { IpTracking } from '../models/IpTracking.js';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { getRealIpAddress } from '../utils/ipUtils.js';

export class UserService {
  static SECRET = process.env.JWT_SECRET;
  
  static makeCharacterDefaults(user) {
    return { userId: user.id, name: user.username };
  }

  // Sign up a new user
  static async signup(userData) {
    const { username, email, password, age, gender } = userData;
    
    // Check if user already exists
    if (await User.findOne({ where: { email } })) {
      throw new Error('البريد مستخدم مسبقاً');
    }
    if (await User.findOne({ where: { username } })) {
      throw new Error('اسم المستخدم مستخدم مسبقاً');
    }

    // Create user and character
    const user = await User.create({ username, email, password, age, gender });
    const character = await Character.create({ userId: user.id, name: user.username });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, characterId: character.id }, 
      this.SECRET, 
      { expiresIn: '7d' }
    );
    
    return { token };
  }

  // Login user
  static async login(credentials, req) {
    const { email, password } = credentials;
    
    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.validPassword(password))) {
      throw new Error('بيانات الدخول غير صحيحة');
    }

    // Check if user is banned
    if (user.isBanned) {
      throw new Error(`Account blocked: ${user.banReason || 'No reason provided'}`);
    }

    // Check if IP is blocked
    if (req) {
      const ipAddress = getRealIpAddress(req);
      const ipBlock = await IpTracking.findOne({
        where: { 
          ipAddress,
          isBlocked: true 
        }
      });

      if (ipBlock) {
        throw new Error(`IP address blocked: ${ipBlock.blockReason || 'No reason provided'}`);
      }
    }

    // Get or create character
    const [character] = await Character.findOrCreate({ 
      where: { userId: user.id }, 
      defaults: { name: user.username, userId: user.id } 
    });
    // Ensure character name is always in sync with username
    if (character.name !== user.username) {
      character.name = user.username;
      await character.save();
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, characterId: character.id }, 
      this.SECRET, 
      { expiresIn: '7d' }
    );
    
    return { token };
  }

  // Add a method to update username and sync character name
  static async updateUsername(userId, newUsername) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');
    user.username = newUsername;
    await user.save();
    const character = await Character.findOne({ where: { userId } });
    if (character) {
      character.name = newUsername;
      await character.save();
    }
    return user;
  }

  // Get all users (for admin purposes)
  static async getAllUsers() {
    return await User.findAll({ 
      attributes: ['id', 'username'] 
    });
  }

  // Get user by ID
  static async getUserById(userId) {
    return await User.findByPk(userId);
  }

  // Get user's VIP status and expiry
  static async getVIPStatus(userId) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');
    const now = new Date();
    return {
      isVIP: user.vipExpiresAt && new Date(user.vipExpiresAt) > now,
      vipExpiresAt: user.vipExpiresAt
    };
  }

  // Get users active in the last 30 minutes
  static async getActiveUsers() {
    const THIRTY_MINUTES_AGO = new Date(Date.now() - 30 * 60 * 1000);
    const characters = await Character.findAll({
      where: { lastActive: { [Op.gte]: THIRTY_MINUTES_AGO } },
      include: [{
        model: User,
        attributes: ['username', 'avatarUrl'],
      }],
      order: [['level', 'DESC']],
      attributes: ['userId', 'name', 'level', 'avatarUrl', 'lastActive'],
    });
    return characters.map(c => ({
      userId: c.userId,
      username: c.User?.username || '',
      avatarUrl: c.User?.avatarUrl || c.avatarUrl,
      level: c.level,
      lastActive: c.lastActive,
      name: c.name,
    }));
  }
} 