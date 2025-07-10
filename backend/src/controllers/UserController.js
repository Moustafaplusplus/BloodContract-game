import { UserService } from '../services/UserService.js';

export class UserController {
  static async signup(req, res) {
    try {
      const { username, nickname, email, password, age } = req.body;
      const result = await UserService.signup({ username, nickname, email, password, age });
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
      const { username, password } = req.body;
      const result = await UserService.login({ username, password });
      res.json(result);
    } catch (error) {
      console.error('🔥 خطأ في تسجيل الدخول:', error);
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
} 