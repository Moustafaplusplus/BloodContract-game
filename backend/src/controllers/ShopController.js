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
} 