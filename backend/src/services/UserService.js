import { User } from '../models/User.js';
import { Character } from '../models/Character.js';
import jwt from 'jsonwebtoken';

export class UserService {
  static SECRET = process.env.JWT_SECRET;
  
  static makeCharacterDefaults(user) {
    return { userId: user.id, name: user.nickname || user.username };
  }

  // Sign up a new user
  static async signup(userData) {
    const { username, nickname, email, password, age } = userData;
    
    // Check if user already exists
    if (await User.findOne({ where: { email } })) {
      throw new Error('البريد مستخدم مسبقاً');
    }
    if (await User.findOne({ where: { username } })) {
      throw new Error('اسم المستخدم مستخدم مسبقاً');
    }

    // Create user and character
    const user = await User.create({ username, nickname, email, password, age });
    const character = await Character.create(this.makeCharacterDefaults(user));

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, characterId: character.id }, 
      this.SECRET, 
      { expiresIn: '7d' }
    );
    
    return { token };
  }

  // Login user
  static async login(credentials) {
    const { username, password } = credentials;
    
    const user = await User.findOne({ where: { username } });
    if (!user || !(await user.validPassword(password))) {
      throw new Error('بيانات الدخول غير صحيحة');
    }

    // Get or create character
    const [character] = await Character.findOrCreate({ 
      where: { userId: user.id }, 
      defaults: this.makeCharacterDefaults(user) 
    });
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, characterId: character.id }, 
      this.SECRET, 
      { expiresIn: '7d' }
    );
    
    return { token };
  }

  // Get all users (for admin purposes)
  static async getAllUsers() {
    return await User.findAll({ 
      attributes: ['id', 'username', 'nickname'] 
    });
  }

  // Get user by ID
  static async getUserById(userId) {
    return await User.findByPk(userId);
  }
} 