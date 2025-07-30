import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { User } from '../models/User.js';
import { UserService } from '../services/UserService.js';
import { auth } from '../middleware/auth.js';

// Multer setup for avatar uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(process.cwd(), 'public', 'avatars');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `user_${req.user.id}_${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

export class UserController {
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
      if (!req.file) return res.status(400).json({ message: 'لم يتم رفع أي صورة.' });
      const user = await User.findByPk(req.user.id);
      if (!user) return res.status(404).json({ message: 'المستخدم غير موجود.' });
      // Save avatar URL (relative to /public)
      user.avatarUrl = `/avatars/${req.file.filename}`;
      await user.save();
      res.json({ avatarUrl: user.avatarUrl });
    } catch (error) {
      res.status(500).json({ message: 'فشل رفع الصورة', error: error.message });
    }
  }
} 