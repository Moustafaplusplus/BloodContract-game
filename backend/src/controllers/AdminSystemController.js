import { User } from '../models/User.js';
import { Character } from '../models/Character.js';
import { IpTracking } from '../models/IpTracking.js';
import { Car } from '../models/Car.js';
import { House } from '../models/House.js';
import { Dog } from '../models/Dog.js';
import { Weapon, Armor } from '../models/Shop.js';
import { BlackcoinPackage } from '../models/Blackcoin.js';
import { VIPPackage } from '../models/Shop.js';
import { sequelize } from '../config/db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Multer storage configurations
const carStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'public/cars';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const houseStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'public/houses';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const dogStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'public/dogs';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const weaponStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'public/weapons';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const armorStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'public/armors';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadCar = multer({ storage: carStorage });
const uploadHouse = multer({ storage: houseStorage });
const uploadDog = multer({ storage: dogStorage });
const uploadWeapon = multer({ storage: weaponStorage });
const uploadArmor = multer({ storage: armorStorage });

export class AdminSystemController {
  // Toggle user ban
  static async toggleUserBan(req, res) {
    try {
      const { userId } = req.params;
      const { banned, reason } = req.body;
      
      const result = await AdminSystemService.toggleUserBan(parseInt(userId), banned, reason);
      res.json({ success: true, ...result });
    } catch (error) {
      console.error('Error toggling user ban:', error);
      if (error.message === 'User not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get user statistics
  static async getUserStats(req, res) {
    try {
      const { userId } = req.params;
      const stats = await AdminSystemService.getUserStats(parseInt(userId));
      res.json(stats);
    } catch (error) {
      console.error('Error getting user stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get system statistics
  static async getSystemStats(req, res) {
    try {
      const stats = await AdminSystemService.getSystemStats();
      res.json(stats);
    } catch (error) {
      console.error('Error getting system stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get user IP addresses
  static async getUserIps(req, res) {
    try {
      const { userId } = req.params;
      const ips = await AdminSystemService.getUserIps(parseInt(userId));
      res.json(ips);
    } catch (error) {
      console.error('Error getting user IPs:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Block an IP address
  static async blockIp(req, res) {
    try {
      const { ipAddress, reason } = req.body;
      
      if (!ipAddress) {
        return res.status(400).json({ error: 'IP address is required' });
      }

      const result = await AdminSystemService.blockIp(ipAddress, reason);
      res.json({ success: true, ...result });
    } catch (error) {
      console.error('Error blocking IP:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Unblock an IP address
  static async unblockIp(req, res) {
    try {
      const { ipAddress } = req.params;
      
      const result = await AdminSystemService.unblockIp(ipAddress);
      res.json({ success: true, ...result });
    } catch (error) {
      console.error('Error unblocking IP:', error);
      if (error.message === 'IP address not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get all blocked IPs
  static async getBlockedIps(req, res) {
    try {
      const blockedIps = await AdminSystemService.getBlockedIps();
      res.json(blockedIps);
    } catch (error) {
      console.error('Error getting blocked IPs:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get IP statistics
  static async getIpStats(req, res) {
    try {
      const stats = await AdminSystemService.getIpStats();
      res.json(stats);
    } catch (error) {
      console.error('Error getting IP stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get flagged IPs (IPs used by more than one user)
  static async getFlaggedIps(req, res) {
    try {
      const flaggedIps = await AdminSystemService.getFlaggedIps();
      res.json(flaggedIps);
    } catch (error) {
      console.error('Error getting flagged IPs:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // --- Car CRUD ---
  static async getAllCars(req, res) {
    const cars = await Car.findAll();
    res.json(cars);
  }
  static async createCar(req, res) {
    const car = await Car.create(req.body);
    res.json(car);
  }
  static async updateCar(req, res) {
    const car = await Car.findByPk(req.params.id);
    if (!car) return res.status(404).json({ error: 'Car not found' });
    await car.update(req.body);
    res.json(car);
  }
  static async deleteCar(req, res) {
    const car = await Car.findByPk(req.params.id);
    if (!car) return res.status(404).json({ error: 'Car not found' });
    await car.destroy();
    res.json({ success: true });
  }
  static uploadCarImage = [uploadCar.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({ imageUrl: `/cars/${req.file.filename}` });
  }];

  // --- House CRUD ---
  static async getAllHouses(req, res) {
    const houses = await House.findAll();
    res.json(houses);
  }
  static async createHouse(req, res) {
    const house = await House.create(req.body);
    res.json(house);
  }
  static async updateHouse(req, res) {
    const house = await House.findByPk(req.params.id);
    if (!house) return res.status(404).json({ error: 'House not found' });
    await house.update(req.body);
    res.json(house);
  }
  static async deleteHouse(req, res) {
    const house = await House.findByPk(req.params.id);
    if (!house) return res.status(404).json({ error: 'House not found' });
    await house.destroy();
    res.json({ success: true });
  }
  static uploadHouseImage = [uploadHouse.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({ imageUrl: `/houses/${req.file.filename}` });
  }];

  // --- Dog CRUD ---
  static async getAllDogs(req, res) {
    const dogs = await Dog.findAll();
    res.json(dogs);
  }
  static async createDog(req, res) {
    const dog = await Dog.create(req.body);
    res.json(dog);
  }
  static async updateDog(req, res) {
    const dog = await Dog.findByPk(req.params.id);
    if (!dog) return res.status(404).json({ error: 'Dog not found' });
    await dog.update(req.body);
    res.json(dog);
  }
  static async deleteDog(req, res) {
    const dog = await Dog.findByPk(req.params.id);
    if (!dog) return res.status(404).json({ error: 'Dog not found' });
    await dog.destroy();
    res.json({ success: true });
  }
  static uploadDogImage = [uploadDog.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({ imageUrl: `/dogs/${req.file.filename}` });
  }];

  // Weapon Management
  static async getAllWeapons(req, res) {
    try {
      const weapons = await Weapon.findAll({
        order: [['name', 'ASC']]
      });
      res.json(weapons);
    } catch (error) {
      console.error('Get weapons error:', error);
      res.status(500).json({ message: 'فشل في تحميل الأسلحة' });
    }
  }

  static async createWeapon(req, res) {
    try {
      const { name, damage, energyBonus, price, rarity, currency, imageUrl } = req.body;
      const weapon = await Weapon.create({
        name,
        damage,
        energyBonus: energyBonus || 0,
        price,
        rarity,
        currency: currency || 'money',
        imageUrl
      });
      res.status(201).json(weapon);
    } catch (error) {
      console.error('Create weapon error:', error);
      res.status(500).json({ message: 'فشل في إنشاء السلاح' });
    }
  }

  static async updateWeapon(req, res) {
    try {
      const { id } = req.params;
      const { name, damage, energyBonus, price, rarity, currency, imageUrl } = req.body;
      
      const weapon = await Weapon.findByPk(id);
      if (!weapon) {
        return res.status(404).json({ message: 'السلاح غير موجود' });
      }

      await weapon.update({
        name,
        damage,
        energyBonus: energyBonus || 0,
        price,
        rarity,
        currency: currency || weapon.currency,
        imageUrl: imageUrl || weapon.imageUrl
      });

      res.json(weapon);
    } catch (error) {
      console.error('Update weapon error:', error);
      res.status(500).json({ message: 'فشل في تحديث السلاح' });
    }
  }

  static async deleteWeapon(req, res) {
    try {
      const { id } = req.params;
      const weapon = await Weapon.findByPk(id);
      if (!weapon) {
        return res.status(404).json({ message: 'السلاح غير موجود' });
      }

      await weapon.destroy();
      res.json({ message: 'تم حذف السلاح بنجاح' });
    } catch (error) {
      console.error('Delete weapon error:', error);
      res.status(500).json({ message: 'فشل في حذف السلاح' });
    }
  }

  static async uploadWeaponImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'لم يتم اختيار ملف' });
      }
      res.json({ imageUrl: `/weapons/${req.file.filename}` });
    } catch (error) {
      console.error('Upload weapon image error:', error);
      res.status(500).json({ message: 'فشل في رفع صورة السلاح' });
    }
  }

  // Armor Management
  static async getAllArmors(req, res) {
    try {
      const armors = await Armor.findAll({
        order: [['name', 'ASC']]
      });
      res.json(armors);
    } catch (error) {
      console.error('Get armors error:', error);
      res.status(500).json({ message: 'فشل في تحميل الدروع' });
    }
  }

  static async createArmor(req, res) {
    try {
      const { name, def, hpBonus, price, rarity, currency, imageUrl } = req.body;
      const armor = await Armor.create({
        name,
        def,
        hpBonus: hpBonus || 0,
        price,
        rarity,
        currency: currency || 'money',
        imageUrl
      });
      res.status(201).json(armor);
    } catch (error) {
      console.error('Create armor error:', error);
      res.status(500).json({ message: 'فشل في إنشاء الدرع' });
    }
  }

  static async updateArmor(req, res) {
    try {
      const { id } = req.params;
      const { name, def, hpBonus, price, rarity, currency, imageUrl } = req.body;
      
      const armor = await Armor.findByPk(id);
      if (!armor) {
        return res.status(404).json({ message: 'الدرع غير موجود' });
      }

      await armor.update({
        name,
        def,
        hpBonus: hpBonus || 0,
        price,
        rarity,
        currency: currency || armor.currency,
        imageUrl: imageUrl || armor.imageUrl
      });

      res.json(armor);
    } catch (error) {
      console.error('Update armor error:', error);
      res.status(500).json({ message: 'فشل في تحديث الدرع' });
    }
  }

  static async deleteArmor(req, res) {
    try {
      const { id } = req.params;
      const armor = await Armor.findByPk(id);
      if (!armor) {
        return res.status(404).json({ message: 'الدرع غير موجود' });
      }

      await armor.destroy();
      res.json({ message: 'تم حذف الدرع بنجاح' });
    } catch (error) {
      console.error('Delete armor error:', error);
      res.status(500).json({ message: 'فشل في حذف الدرع' });
    }
  }

  static async uploadArmorImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'لم يتم اختيار ملف' });
      }
      res.json({ imageUrl: `/armors/${req.file.filename}` });
    } catch (error) {
      console.error('Upload armor image error:', error);
      res.status(500).json({ message: 'فشل في رفع صورة الدرع' });
    }
  }

  // Blackcoin Package Management
  static async getAllBlackcoinPackages(req, res) {
    try {
      const packages = await BlackcoinPackage.findAll({
        order: [['usdPrice', 'ASC']]
      });
      res.json(packages);
    } catch (error) {
      console.error('Get blackcoin packages error:', error);
      res.status(500).json({ message: 'فشل في تحميل باقات العملة السوداء' });
    }
  }

  static async createBlackcoinPackage(req, res) {
    try {
      const { name, usdPrice, blackcoinAmount, bonus, isActive } = req.body;
      const pkg = await BlackcoinPackage.create({
        name,
        usdPrice,
        blackcoinAmount,
        bonus: bonus || 0,
        isActive: isActive !== undefined ? isActive : true
      });
      res.status(201).json(pkg);
    } catch (error) {
      console.error('Create blackcoin package error:', error);
      res.status(500).json({ message: 'فشل في إنشاء باقة العملة السوداء' });
    }
  }

  static async updateBlackcoinPackage(req, res) {
    try {
      const { id } = req.params;
      const { name, usdPrice, blackcoinAmount, bonus, isActive } = req.body;
      
      const pkg = await BlackcoinPackage.findByPk(id);
      if (!pkg) {
        return res.status(404).json({ message: 'الباقة غير موجودة' });
      }

      await pkg.update({
        name,
        usdPrice,
        blackcoinAmount,
        bonus: bonus || 0,
        isActive: isActive !== undefined ? isActive : pkg.isActive
      });

      res.json(pkg);
    } catch (error) {
      console.error('Update blackcoin package error:', error);
      res.status(500).json({ message: 'فشل في تحديث باقة العملة السوداء' });
    }
  }

  static async deleteBlackcoinPackage(req, res) {
    try {
      const { id } = req.params;
      const pkg = await BlackcoinPackage.findByPk(id);
      if (!pkg) {
        return res.status(404).json({ message: 'الباقة غير موجودة' });
      }

      await pkg.destroy();
      res.json({ message: 'تم حذف الباقة بنجاح' });
    } catch (error) {
      console.error('Delete blackcoin package error:', error);
      res.status(500).json({ message: 'فشل في حذف باقة العملة السوداء' });
    }
  }

  // VIP Package Management
  static async getAllVIPPackages(req, res) {
    try {
      const packages = await VIPPackage.findAll({
        order: [['durationDays', 'ASC']]
      });
      res.json(packages);
    } catch (error) {
      console.error('Get VIP packages error:', error);
      res.status(500).json({ message: 'فشل في تحميل باقات VIP' });
    }
  }

  static async createVIPPackage(req, res) {
    try {
      const { name, durationDays, price, isActive } = req.body;
      const pkg = await VIPPackage.create({
        name,
        durationDays,
        price,
        isActive: isActive !== undefined ? isActive : true
      });
      res.status(201).json(pkg);
    } catch (error) {
      console.error('Create VIP package error:', error);
      res.status(500).json({ message: 'فشل في إنشاء باقة VIP' });
    }
  }

  static async updateVIPPackage(req, res) {
    try {
      const { id } = req.params;
      const { name, durationDays, price, isActive } = req.body;
      
      const pkg = await VIPPackage.findByPk(id);
      if (!pkg) {
        return res.status(404).json({ message: 'الباقة غير موجودة' });
      }

      await pkg.update({
        name,
        durationDays,
        price,
        isActive: isActive !== undefined ? isActive : pkg.isActive
      });

      res.json(pkg);
    } catch (error) {
      console.error('Update VIP package error:', error);
      res.status(500).json({ message: 'فشل في تحديث باقة VIP' });
    }
  }

  static async deleteVIPPackage(req, res) {
    try {
      const { id } = req.params;
      const pkg = await VIPPackage.findByPk(id);
      if (!pkg) {
        return res.status(404).json({ message: 'الباقة غير موجودة' });
      }

      await pkg.destroy();
      res.json({ message: 'تم حذف الباقة بنجاح' });
    } catch (error) {
      console.error('Delete VIP package error:', error);
      res.status(500).json({ message: 'فشل في حذف باقة VIP' });
    }
  }
}

// Export for use in routes
export const getAllCars = AdminSystemController.getAllCars;
export const createCar = AdminSystemController.createCar;
export const updateCar = AdminSystemController.updateCar;
export const deleteCar = AdminSystemController.deleteCar;
export const uploadCarImage = AdminSystemController.uploadCarImage;
export const getAllHouses = AdminSystemController.getAllHouses;
export const createHouse = AdminSystemController.createHouse;
export const updateHouse = AdminSystemController.updateHouse;
export const deleteHouse = AdminSystemController.deleteHouse;
export const uploadHouseImage = AdminSystemController.uploadHouseImage;
export const getAllDogs = AdminSystemController.getAllDogs;
export const createDog = AdminSystemController.createDog;
export const updateDog = AdminSystemController.updateDog;
export const deleteDog = AdminSystemController.deleteDog;
export const uploadDogImage = AdminSystemController.uploadDogImage; 

// Export multer upload instances
export { uploadCar, uploadHouse, uploadDog, uploadWeapon, uploadArmor }; 