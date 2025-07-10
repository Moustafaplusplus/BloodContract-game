import { InventoryItem } from '../models/Inventory.js';
import { Character } from '../models/Character.js';
import { Weapon, Armor } from '../models/Shop.js';
import { Car } from '../models/Car.js';
import { io } from '../socket.js';

export class InventoryService {
  // Helper functions
  static canonicalType(type) {
    if (['weapon', 'melee', 'rifle', 'sniper'].includes(type)) return 'weapon';
    if (type === 'armor') return 'armor';
    if (type === 'car') return 'car';
    return null;
  }

  static modelFor(type) {
    switch (type) {
      case 'weapon': return Weapon;
      case 'armor': return Armor;
      case 'car': return Car;
      default: return null;
    }
  }

  // Get user's inventory
  static async getUserInventory(userId) {
    const rows = await InventoryItem.findAll({ where: { userId } });

    const items = await Promise.all(rows.map(async (row) => {
      const refModel = this.modelFor(row.itemType);
      const ref = refModel ? await refModel.findByPk(row.itemId) : null;
      return { 
        id: row.itemId, 
        type: row.itemType, 
        equipped: row.equipped, 
        ...ref?.toJSON() 
      };
    }));

    return { items };
  }

  // Equip an item
  static async equipItem(userId, type, itemId) {
    const slot = this.canonicalType(type);
    if (!slot) {
      throw new Error('invalid type');
    }

    const itemRow = await InventoryItem.findOne({ 
      where: { userId, itemType: slot, itemId } 
    });
    if (!itemRow) {
      throw new Error('item not owned');
    }

    // Unequip all items of this type
    await InventoryItem.update(
      { equipped: false }, 
      { where: { userId, itemType: slot } }
    );

    // Equip the selected item
    itemRow.equipped = true;
    await itemRow.save();

    // Update character equipment
    const char = await Character.findOne({ where: { userId } });
    if (slot === 'weapon') char.equippedWeaponId = itemId;
    else if (slot === 'armor') char.equippedArmorId = itemId;
    else if (slot === 'car') char.equippedCarId = itemId;
    await char.save();

    // Push new HUD update
    if (io) {
      io.to(String(userId)).emit('hud:update', await char.toSafeJSON());
    }

    return { message: 'equipped', slot, itemId };
  }

  // Unequip an item
  static async unequipItem(userId, type) {
    const slot = this.canonicalType(type);
    if (!slot) {
      throw new Error('invalid type');
    }

    await InventoryItem.update(
      { equipped: false }, 
      { where: { userId, itemType: slot } }
    );

    // Update character equipment
    const char = await Character.findOne({ where: { userId } });
    if (slot === 'weapon') char.equippedWeaponId = null;
    else if (slot === 'armor') char.equippedArmorId = null;
    else if (slot === 'car') char.equippedCarId = null;
    await char.save();

    // Push new HUD update
    if (io) {
      io.to(String(userId)).emit('hud:update', await char.toSafeJSON());
    }

    return { message: 'unequipped', slot };
  }

  // Sell an item
  static async sellItem(userId, type, itemId) {
    const slot = this.canonicalType(type);
    if (!slot) {
      throw new Error('invalid type');
    }

    const row = await InventoryItem.findOne({ 
      where: { userId, itemType: slot, itemId } 
    });
    if (!row) {
      throw new Error('item not owned');
    }

    const refModel = this.modelFor(slot);
    const ref = refModel ? await refModel.findByPk(itemId) : null;
    const sellPrice = Math.round((ref?.price || 0) * 0.5);

    // Update character money
    const char = await Character.findOne({ where: { userId } });
    char.money += sellPrice;
    await char.save();

    // Remove item from inventory
    await row.destroy();

    // Push new HUD update
    if (io) {
      io.to(String(userId)).emit('hud:update', await char.toSafeJSON());
    }

    return { message: 'sold', sellPrice };
  }
} 