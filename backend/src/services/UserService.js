import { User } from '../models/User.js';
import { Character } from '../models/Character.js';
import { IpTracking } from '../models/IpTracking.js';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { getRealIpAddress } from '../utils/ipUtils.js';

export class UserService {
  static SECRET = process.env.JWT_SECRET;
  
  // Generate custom token for Firebase users
  static generateCustomToken(userId, firebaseUid) {
    if (!this.SECRET) {
      console.error('❌ JWT_SECRET is not set');
      throw new Error('JWT_SECRET environment variable is required');
    }
    
    console.log('🔑 Generating custom token for user:', userId);
    return jwt.sign(
      { id: userId, firebaseUid },
      this.SECRET,
      { expiresIn: '7d' }
    );
  }
  
  static makeCharacterDefaults(user) {
    return { userId: user.id, name: user.username };
  }

  // Create a guest user
  static async createGuestUser() {
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const guestUsername = `ضيف_${Math.random().toString(36).substr(2, 6)}`;
    
    // Create guest user
    const user = await User.create({ 
      username: guestUsername,
      email: `${guestId}@guest.local`,
      password: guestId, // This will be ignored for guest users
      age: 18,
      gender: 'male',
      isGuest: true,
      hasSeenIntro: false // New users haven't seen intro
    });
    
    // Create character for guest
    const character = await Character.create({ 
      userId: user.id, 
      name: guestUsername 
    });
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, characterId: character.id, isGuest: true }, 
      this.SECRET, 
      { expiresIn: '30d' } // Longer expiry for guests
    );
    
    return { 
      token,
      user: {
        id: user.id,
        username: user.username,
        isGuest: true,
        hasSeenIntro: false
      },
      message: 'تم إنشاء حساب ضيف بنجاح'
    };
  }

  // Mark intro as seen
  static async markIntroAsSeen(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('المستخدم غير موجود');
    }
    
    user.hasSeenIntro = true;
    await user.save();
    
    return { message: 'تم تحديث حالة العرض التقديمي' };
  }

  // Get intro status
  static async getIntroStatus(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('المستخدم غير موجود');
    }
    
    return user.hasSeenIntro || false;
  }

  // Sync guest account to registered account
  static async syncGuestToRegistered(guestUserId, registrationData) {
    const { username, email, password, age, gender } = registrationData;
    
    // Check if email or username already exists
    if (await User.findOne({ where: { email } })) {
      throw new Error('البريد مستخدم مسبقاً');
    }
    if (await User.findOne({ where: { username } })) {
      throw new Error('اسم المستخدم مستخدم مسبقاً');
    }
    
    // Get guest user and character
    const guestUser = await User.findByPk(guestUserId);
    if (!guestUser || !guestUser.isGuest) {
      throw new Error('المستخدم الضيف غير موجود');
    }
    
    const guestCharacter = await Character.findOne({ where: { userId: guestUserId } });
    if (!guestCharacter) {
      throw new Error('شخصية المستخدم الضيف غير موجودة');
    }
    
    // Update guest user to registered user
    guestUser.username = username;
    guestUser.email = email;
    guestUser.password = password;
    guestUser.age = age;
    guestUser.gender = gender;
    guestUser.isGuest = false;
    await guestUser.save();
    
    // Update character name to match new username
    guestCharacter.name = username;
    await guestCharacter.save();
    
    // Generate new token for registered user
    const token = jwt.sign(
      { id: guestUser.id, characterId: guestCharacter.id }, 
      this.SECRET, 
      { expiresIn: '7d' }
    );
    
    return { 
      token,
      message: 'تم ربط الحساب الضيف بنجاح'
    };
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

    // Create user
    const user = await User.create({ 
      username, 
      email, 
      password, 
      age, 
      gender
    });
    
    // Create character
    const character = await Character.create({ userId: user.id, name: user.username });
    
    // Generate full access token
    const token = jwt.sign(
      { id: user.id, characterId: character.id }, 
      this.SECRET, 
      { expiresIn: '7d' }
    );
    
    return { 
      token,
      message: 'تم إنشاء الحساب بنجاح'
    };
  }

  // Link existing account to Google
  static async linkToGoogle(userId, googleId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('المستخدم غير موجود');
    }
    
    user.googleId = googleId;
    await user.save();
    
    return user;
  }

  // Login user
  static async login(credentials, req) {
    const { email, password } = credentials;
    
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error('بيانات الدخول غير صحيحة');
    }
    
    // Check if user has a password (not Google-only user)
    if (!user.password || user.password.length < 6) {
      throw new Error('هذا الحساب مسجل عبر جوجل. يرجى استخدام تسجيل الدخول بحساب جوجل');
    }
    
    if (!(await user.validPassword(password))) {
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
    // Note: We no longer auto-sync character name with username to allow name changes
    
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
      attributes: ['userId', 'name', 'level', 'avatarUrl', 'lastActive', 'vipExpiresAt'],
    });
    return characters.map(c => ({
      userId: c.userId,
      username: c.User?.username || '',
      avatarUrl: c.User?.avatarUrl || c.avatarUrl,
      level: c.level,
      lastActive: c.lastActive,
      name: c.name,
      vipExpiresAt: c.vipExpiresAt,
    }));
  }
} 