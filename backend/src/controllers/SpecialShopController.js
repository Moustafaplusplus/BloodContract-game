import { SpecialShopService } from '../services/SpecialShopService.js';
import { VIPPackage } from '../models/Shop.js';
import { CarService } from '../services/CarService.js';
import { HouseService } from '../services/HouseService.js';
import { DogService } from '../services/DogService.js';

export class SpecialShopController {
  static async getBlackcoinPackages(req, res) {
    try {
      const packages = await SpecialShopService.getBlackcoinPackages();
      res.json(packages);
    } catch (error) {
      console.error('Get blackcoin packages error:', error);
      res.status(500).json({ message: 'فشل تحميل باقات البلاك كوين' });
    }
  }

  static async buyBlackcoin(req, res) {
    try {
      const { packageId } = req.body;
      if (!packageId) {
        return res.status(400).json({ message: 'معرف الباقة مطلوب' });
      }
      const result = await SpecialShopService.purchaseBlackcoin(req.user.id, packageId);
      if (!result || !result.package) {
        return res.status(500).json({ message: 'فشل شراء البلاك كوين (package undefined)' });
      }
      const safePackage = {
        id: result.package.id ?? packageId ?? 'default',
        name: result.package.name ?? 'افتراضي',
        blackcoinAmount: result.package.blackcoinAmount ?? result.blackcoinsGranted ?? 100
      };
      res.status(201).json({
        ...result,
        package: safePackage
      });
    } catch (error) {
      console.error('Buy blackcoin error:', error);
      res.status(500).json({ message: 'فشل شراء البلاك كوين' });
    }
  }

  static async getVIPPackages(req, res) {
    try {
      const vipPackages = await VIPPackage.findAll({ where: { isActive: true } });
      res.json(vipPackages);
    } catch (error) {
      console.error('VIP packages error:', error);
      res.sendStatus(500);
    }
  }

  static async buyVIP(req, res) {
    try {
      const { packageId } = req.body;
      if (!packageId) return res.status(400).json({ message: 'يجب تحديد باقة VIP' });
      const result = await SpecialShopService.purchaseVIP(req.user.id, packageId);
      res.json(result);
    } catch (error) {
      console.error('Buy VIP error:', error);
      res.status(400).json({ message: error.message || 'فشل شراء VIP' });
    }
  }

  static async getSpecialItems(req, res) {
    try {
      const weapons = await SpecialShopService.getAllWeapons({ currency: 'blackcoin' });
      const armors = await SpecialShopService.getAllArmors({ currency: 'blackcoin' });
      res.json({ weapons, armors });
    } catch (error) {
      console.error('Special shop items error:', error);
      res.sendStatus(500);
    }
  }

  static async buySpecialItem(req, res) {
    try {
      const quantity = parseInt(req.body.quantity) || 1;
      const result = await SpecialShopService.purchaseSpecialItem(req.user.id, req.params.id, quantity);
      res.json(result);
    } catch (error) {
      console.error('Buy special item error:', error);
      if (error.message === 'العنصر غير موجود') {
        return res.status(404).json({ message: error.message });
      }
      if (error.message === 'لا تملك عملة سوداء كافية') {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: 'فشل شراء العنصر الخاص' });
    }
  }

  static async getSpecialCars(req, res) {
    try {
      const cars = await CarService.getAllCars({ currency: 'blackcoin' });
      res.json(cars);
    } catch (error) {
      console.error('Special shop cars error:', error);
      res.sendStatus(500);
    }
  }

  static async getSpecialHouses(req, res) {
    try {
      const houses = await HouseService.getAllHouses({ currency: 'blackcoin' });
      res.json(houses);
    } catch (error) {
      console.error('Special shop houses error:', error);
      res.sendStatus(500);
    }
  }

  static async getSpecialDogs(req, res) {
    try {
      const dogs = await DogService.getAllDogs({ currency: 'blackcoin' });
      res.json(dogs);
    } catch (error) {
      console.error('Special shop dogs error:', error);
      res.sendStatus(500);
    }
  }
} 