import { ShopService } from '../services/ShopService.js';

export class ShopController {
  static async getWeapons(req, res) {
    try {
      const weapons = await ShopService.getAllWeapons();
      res.json(weapons);
    } catch (error) {
      console.error('Shop weapons error:', error);
      res.sendStatus(500);
    }
  }

  static async getArmors(req, res) {
    try {
      const armors = await ShopService.getAllArmors();
      res.json(armors);
    } catch (error) {
      console.error('Shop armors error:', error);
      res.sendStatus(500);
    }
  }

  static async buyWeapon(req, res) {
    try {
      const quantity = parseInt(req.body.quantity) || 1;
      const result = await ShopService.purchaseWeapon(req.user.id, req.params.id, quantity);
      res.json(result);
    } catch (error) {
      console.error('Buy weapon error:', error);
      if (error.message === 'السلاح غير موجود') {
        return res.status(404).json({ message: error.message });
      }
      if (error.message === 'لا تملك مالاً كافياً' || error.message === 'العنصر موجود لديك بالفعل') {
        return res.status(400).json({ message: error.message });
      }
      res.sendStatus(500);
    }
  }

  static async buyArmor(req, res) {
    try {
      const quantity = parseInt(req.body.quantity) || 1;
      const result = await ShopService.purchaseArmor(req.user.id, req.params.id, quantity);
      res.json(result);
    } catch (error) {
      console.error('Buy armor error:', error);
      if (error.message === 'الدرع غير موجود') {
        return res.status(404).json({ message: error.message });
      }
      if (error.message === 'لا تملك مالاً كافياً' || error.message === 'العنصر موجود لديك بالفعل') {
        return res.status(400).json({ message: error.message });
      }
      res.sendStatus(500);
    }
  }

  // Admin methods for weapon management
  static async getAllWeapons(req, res) {
    try {
      const weapons = await ShopService.getAllWeaponsForAdmin();
      res.json(weapons);
    } catch (error) {
      console.error('Admin get weapons error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  static async createWeapon(req, res) {
    try {
      // Basic validation
      const requiredFields = [
        'name', 'damage', 'energyBonus', 'price', 'rarity', 'imageUrl', 'currency'
      ];
      for (const field of requiredFields) {
        if (req.body[field] === undefined) {
          return res.status(400).json({ error: `Missing field: ${field}` });
        }
      }

      const weapon = await ShopService.createWeapon(req.body);
      res.status(201).json(weapon);
    } catch (error) {
      console.error('Create weapon error:', error);
      res.status(500).json({ error: error.message || 'Server error' });
    }
  }

  static async updateWeapon(req, res) {
    try {
      const weaponId = parseInt(req.params.id, 10);
      if (!weaponId) {
        return res.status(400).json({ error: 'Invalid weapon ID' });
      }

      // Basic validation
      const requiredFields = [
        'name', 'damage', 'energyBonus', 'price', 'rarity', 'imageUrl', 'currency'
      ];
      for (const field of requiredFields) {
        if (req.body[field] === undefined) {
          return res.status(400).json({ error: `Missing field: ${field}` });
        }
      }

      const weapon = await ShopService.updateWeapon(weaponId, req.body);
      if (!weapon) {
        return res.status(404).json({ error: 'Weapon not found' });
      }
      res.json(weapon);
    } catch (error) {
      console.error('Update weapon error:', error);
      res.status(500).json({ error: error.message || 'Server error' });
    }
  }

  static async deleteWeapon(req, res) {
    try {
      const weaponId = parseInt(req.params.id, 10);
      if (!weaponId) {
        return res.status(400).json({ error: 'Invalid weapon ID' });
      }

      const success = await ShopService.deleteWeapon(weaponId);
      if (!success) {
        return res.status(404).json({ error: 'Weapon not found' });
      }
      res.json({ message: 'Weapon deleted successfully' });
    } catch (error) {
      console.error('Delete weapon error:', error);
      res.status(500).json({ error: error.message || 'Server error' });
    }
  }

  // Admin methods for armor management
  static async getAllArmors(req, res) {
    try {
      const armors = await ShopService.getAllArmorsForAdmin();
      res.json(armors);
    } catch (error) {
      console.error('Admin get armors error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  static async createArmor(req, res) {
    try {
      // Basic validation
      const requiredFields = [
        'name', 'def', 'hpBonus', 'price', 'rarity', 'imageUrl', 'currency'
      ];
      for (const field of requiredFields) {
        if (req.body[field] === undefined) {
          return res.status(400).json({ error: `Missing field: ${field}` });
        }
      }

      const armor = await ShopService.createArmor(req.body);
      res.status(201).json(armor);
    } catch (error) {
      console.error('Create armor error:', error);
      res.status(500).json({ error: error.message || 'Server error' });
    }
  }

  static async updateArmor(req, res) {
    try {
      const armorId = parseInt(req.params.id, 10);
      if (!armorId) {
        return res.status(400).json({ error: 'Invalid armor ID' });
      }

      // Basic validation
      const requiredFields = [
        'name', 'def', 'hpBonus', 'price', 'rarity', 'imageUrl', 'currency'
      ];
      for (const field of requiredFields) {
        if (req.body[field] === undefined) {
          return res.status(400).json({ error: `Missing field: ${field}` });
        }
      }

      const armor = await ShopService.updateArmor(armorId, req.body);
      if (!armor) {
        return res.status(404).json({ error: 'Armor not found' });
      }
      res.json(armor);
    } catch (error) {
      console.error('Update armor error:', error);
      res.status(500).json({ error: error.message || 'Server error' });
    }
  }

  static async deleteArmor(req, res) {
    try {
      const armorId = parseInt(req.params.id, 10);
      if (!armorId) {
        return res.status(400).json({ error: 'Invalid armor ID' });
      }

      const success = await ShopService.deleteArmor(armorId);
      if (!success) {
        return res.status(404).json({ error: 'Armor not found' });
      }
      res.json({ message: 'Armor deleted successfully' });
    } catch (error) {
      console.error('Delete armor error:', error);
      res.status(500).json({ error: error.message || 'Server error' });
    }
  }
} 