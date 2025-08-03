import { User } from '../models/User.js';
import { UserService } from '../services/UserService.js';
import { firebaseAuth } from '../middleware/firebaseAuth.js';
import { uploadToFirebase } from '../config/firebase.js';

export class UserController {
  static async guestLogin(req, res) {
    try {
      const result = await UserService.createGuestUser();
      res.json(result);
    } catch (error) {
      console.error('🔥 خطأ في تسجيل الدخول كضيف:', error);
      res.status(500).json({ message: 'فشل تسجيل الدخول كضيف', error: error.message });
    }
  }

  static async syncGuestAccount(req, res) {
    try {
      const { username, email, password, age, gender } = req.body;
      const guestUserId = req.user.id;
      
      const result = await UserService.syncGuestToRegistered(guestUserId, {
        username,
        email,
        password,
        age,
        gender
      });
      
      res.json(result);
    } catch (error) {
      console.error('🔥 خطأ في ربط الحساب الضيف:', error);
      if (error.message === 'البريد مستخدم مسبقاً' || error.message === 'اسم المستخدم مستخدم مسبقاً') {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: 'فشل ربط الحساب الضيف', error: error.message });
    }
  }

  static async markIntroAsSeen(req, res) {
    try {
      const userId = req.user.id;
      await UserService.markIntroAsSeen(userId);
      res.json({ message: 'تم تحديث حالة العرض التقديمي' });
    } catch (error) {
      console.error('🔥 خطأ في تحديث حالة العرض التقديمي:', error);
      res.status(500).json({ message: 'فشل تحديث حالة العرض التقديمي', error: error.message });
    }
  }

  static async getIntroStatus(req, res) {
    try {
      const userId = req.user.id;
      const hasSeenIntro = await UserService.getIntroStatus(userId);
      res.json({ hasSeenIntro });
    } catch (error) {
      console.error('🔥 خطأ في جلب حالة العرض التقديمي:', error);
      res.status(500).json({ message: 'فشل جلب حالة العرض التقديمي', error: error.message });
    }
  }

  static async signup(req, res) {
    try {
      const { username, email, password, age, gender } = req.body;
      const result = await UserService.signup({ username, email, password, age, gender });
      res.json(result);
    } catch (error) {
      console.error('🔥 خطأ في التسجيل:', error);
      if (error.message === 'البريد مستخدم مسبقاً' || error.message === 'اسم المستخدم مستخدم مسبقاً') {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: 'فشل التسجيل', error: error.message });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await UserService.login({ email, password }, req);
      res.json(result);
    } catch (error) {
      console.error('🔥 خطأ في تسجيل الدخول:', error);
      if (error.message.includes('Account blocked') || error.message.includes('IP address blocked')) {
        return res.status(403).json({ message: error.message });
      }
      if (error.message === 'بيانات الدخول غير صحيحة') {
        return res.status(401).json({ message: error.message });
      }
      res.status(500).json({ message: 'فشل تسجيل الدخول', error: error.message });
    }
  }

  static async getAllUsers(req, res) {
    try {
      const users = await UserService.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error('خطأ في جلب المستخدمين:', error);
      res.status(500).json({ error: 'فشل جلب المستخدمين' });
    }
  }

  static async getActiveUsers(req, res) {
    try {
      const users = await UserService.getActiveUsers();
      res.json(users);
    } catch (error) {
      console.error('خطأ في جلب المستخدمين النشطين:', error);
      res.status(500).json({ error: 'فشل جلب المستخدمين النشطين' });
    }
  }

  static async getUserById(req, res) {
    try {
      const user = await UserService.getUserById(req.params.id);
      if (!user) return res.status(404).json({ message: 'المستخدم غير موجود.' });
      
      // Get character information
      const { Character } = await import('../models/Character.js');
      const character = await Character.findOne({ where: { userId: user.id } });
      
      res.json({ 
        id: user.id, 
        username: user.username,
        isGuest: user.isGuest,
        character: character ? {
          name: character.name,
          level: character.level
        } : null
      });
    } catch (error) {
      res.status(500).json({ message: 'فشل جلب المستخدم', error: error.message });
    }
  }

  static async uploadAvatar(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      const file = req.file;
      const userId = req.user.id;
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({ error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' });
      }
      
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
      }
      
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Upload to Firebase Storage
      const result = await uploadToFirebase(file, userId);
      
      // Update user's avatar URL
      user.avatarUrl = result.publicUrl;
      await user.save();
      
      res.json({
        success: true,
        avatarUrl: result.publicUrl,
        message: 'Avatar uploaded successfully'
      });
    } catch (error) {
      console.error('Avatar upload error:', error);
      res.status(500).json({ error: 'Failed to upload avatar' });
    }
  }
} 