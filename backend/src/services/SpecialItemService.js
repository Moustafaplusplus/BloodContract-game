import { SpecialItem } from '../models/SpecialItem.js';
import { InventoryItem } from '../models/Inventory.js';
import { Character } from '../models/Character.js';
import { io } from '../socket.js';

export class SpecialItemService {
  static async getAllSpecialItems(filters = {}) {
    const whereClause = { isAvailable: true };
    
    if (filters.currency) {
      whereClause.currency = filters.currency;
    }
    
    if (filters.type) {
      whereClause.type = filters.type;
    }

    return await SpecialItem.findAll({ where: whereClause });
  }

  static async getSpecialItemById(id) {
    return await SpecialItem.findByPk(id);
  }

  static async purchaseSpecialItem(userId, itemId, quantity = 1) {
    const item = await SpecialItem.findByPk(itemId);
    if (!item || !item.isAvailable) {
      throw new Error('العنصر غير موجود');
    }

    const character = await Character.findOne({ where: { userId } });
    if (!character) {
      throw new Error('الشخصية غير موجودة');
    }

    const totalCost = item.price * quantity;
    
    // Check if user has enough currency
    if (item.currency === 'money') {
      if (character.money < totalCost) {
        throw new Error('لا تملك مالاً كافياً');
      }
    } else if (item.currency === 'blackcoin') {
      if (character.blackcoins < totalCost) {
        throw new Error('لا تملك عملة سوداء كافية');
      }
    }

    // Deduct currency
    if (item.currency === 'money') {
      character.money -= totalCost;
    } else if (item.currency === 'blackcoin') {
      character.blackcoins -= totalCost;
    }
    await character.save();

    // Add to inventory
    await this.addItemToInventory(userId, itemId, quantity);

    // Emit HUD update
    if (io) {
      io.to(String(userId)).emit("hud:update", await character.toSafeJSON());
    }

    return {
      message: 'تم شراء العنصر بنجاح',
      item: item,
      quantity: quantity,
      totalCost: totalCost
    };
  }

  static async addItemToInventory(userId, itemId, quantity = 1) {
    let inventoryItem = await InventoryItem.findOne({
      where: { userId, itemType: 'special', itemId, equipped: false }
    });

    if (inventoryItem) {
      inventoryItem.quantity += quantity;
      await inventoryItem.save();
    } else {
      await InventoryItem.create({
        userId,
        itemType: 'special',
        itemId,
        equipped: false,
        slot: null,
        quantity
      });
    }
  }

  static async useSpecialItem(userId, itemId) {
    const item = await SpecialItem.findByPk(itemId);
    if (!item) {
      throw new Error('العنصر غير موجود');
    }

    const character = await Character.findOne({ where: { userId } });
    if (!character) {
      throw new Error('الشخصية غير موجودة');
    }

    // Check if user has the item
    const inventoryItem = await InventoryItem.findOne({
      where: { userId, itemType: 'special', itemId, equipped: false }
    });

    if (!inventoryItem || inventoryItem.quantity < 1) {
      throw new Error('لا تملك هذا العنصر');
    }



    // Apply effects
    const effects = item.effect;
    let effectApplied = false;

    if (effects.health) {
      const maxHp = character.getMaxHp();
      if (effects.health === 'max') {
        character.hp = maxHp;
      } else {
        character.hp = Math.min(character.hp + effects.health, maxHp);
      }
      effectApplied = true;
    }

    if (effects.energy) {
      const maxEnergy = character.maxEnergy;
      if (effects.energy === 'max') {
        character.energy = maxEnergy;
      } else {
        character.energy = Math.min(character.energy + effects.energy, maxEnergy);
      }
      effectApplied = true;
    }

    // Save character changes
    await character.save();

    // Update inventory - item is consumed
    inventoryItem.quantity -= 1;
    
    if (inventoryItem.quantity <= 0) {
      await inventoryItem.destroy();
    } else {
      await inventoryItem.save();
    }

    // Emit HUD update
    if (io) {
      io.to(String(userId)).emit("hud:update", await character.toSafeJSON());
    }

    return {
      message: 'تم استخدام العنصر بنجاح',
      item: item,
      effects: effects,
      effectApplied
    };
  }

  static async sellSpecialItem(userId, itemId) {
    const item = await SpecialItem.findByPk(itemId);
    if (!item) {
      throw new Error('العنصر غير موجود');
    }

    const inventoryItem = await InventoryItem.findOne({
      where: { userId, itemType: 'special', itemId, equipped: false }
    });

    if (!inventoryItem || inventoryItem.quantity < 1) {
      throw new Error('لا تملك هذا العنصر');
    }

    const character = await Character.findOne({ where: { userId } });
    const sellPrice = Math.round(item.price * 0.25);

    // Add money to character
    character.money += sellPrice;
    await character.save();

    // Remove item from inventory
    inventoryItem.quantity -= 1;
    if (inventoryItem.quantity <= 0) {
      await inventoryItem.destroy();
    } else {
      await inventoryItem.save();
    }

    // Emit HUD update
    if (io) {
      io.to(String(userId)).emit("hud:update", await character.toSafeJSON());
    }

    return {
      message: 'تم بيع العنصر بنجاح',
      sellPrice: sellPrice
    };
  }

  // Admin methods
  static async createSpecialItem(itemData) {
    // Auto-set effects based on type
    let effect = { ...itemData.effect };
    
    if (itemData.type === 'HEALTH_POTION') {
      effect = { health: 'max', energy: 0, duration: 0 };
    } else if (itemData.type === 'ENERGY_POTION') {
      effect = { health: 0, energy: 'max', duration: 0 };
    }

    // Create the special item with auto-set effects
    return await SpecialItem.create({
      ...itemData,
      effect
    });
  }

  static async updateSpecialItem(id, itemData) {
    const item = await SpecialItem.findByPk(id);
    if (!item) {
      return null;
    }
    await item.update(itemData);
    return item;
  }

  static async deleteSpecialItem(id) {
    const item = await SpecialItem.findByPk(id);
    if (!item) {
      return false;
    }
    await item.destroy();
    return true;
  }

  static async getAllSpecialItemsForAdmin() {
    return await SpecialItem.findAll();
  }
} 