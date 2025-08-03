import { InventoryItem } from '../models/Inventory.js';
import { Character } from '../models/Character.js';
import { Weapon, Armor } from '../models/Shop.js';
import { SpecialItem } from '../models/SpecialItem.js';
import { CharacterService } from './CharacterService.js';
import { SpecialItemService } from './SpecialItemService.js';
import { io, emitNotification } from '../socket.js';
import { NotificationService } from './NotificationService.js';

export class InventoryService {
  // Helper functions
  static canonicalType(type) {
    if (type === "weapon") return "weapon";
    if (type === "armor") return "armor";
    if (type === "special") return "special";
    return null;
  }

  static modelFor(type) {
    switch (type) {
      case "weapon": return Weapon;
      case "armor": return Armor;
      case "special": return SpecialItem;
      default: return null;
    }
  }

  // Get user's inventory: always return a flat list, each row is either equipped (slot set) or unequipped (slot null), with correct quantity
  static async getUserInventory(userId) {
    const rows = await InventoryItem.findAll({ where: { userId } });
    const items = await Promise.all(rows.map(async (row) => {
      const refModel = this.modelFor(row.itemType);
      const ref = refModel ? await refModel.findByPk(row.itemId) : null;
      
      const item = {
        id: row.id,
        itemId: row.itemId,
        type: row.itemType,
        equipped: row.equipped,
        slot: row.slot,
        quantity: row.quantity,
        ...ref?.toJSON(),
      };
      
      // Ensure the type field is not overridden by the reference model
      item.type = row.itemType;
      return item;
    }));
    
    return { items };
  }

  // Equip an item: move one from unequipped to equipped (slot)
  static async equipItem(userId, type, itemId, slot) {
    const itemType = this.canonicalType(type);
    if (!itemType) throw new Error("invalid type");
    // Find unequipped row
    const unequippedRow = await InventoryItem.findOne({
      where: { userId, itemType, itemId, equipped: false },
    });
    if (!unequippedRow || unequippedRow.quantity < 1) throw new Error("item not owned");
    // Check if slot is already occupied
    const slotRow = await InventoryItem.findOne({ where: { userId, itemType, slot, equipped: true } });
    if (slotRow) throw new Error("slot already occupied");
    // Decrement unequipped quantity
    unequippedRow.quantity -= 1;
    await unequippedRow.save();
    // Create equipped row
    await InventoryItem.create({
      userId,
      itemType,
      itemId,
      equipped: true,
      slot,
      quantity: 1,
    });
    // Remove unequipped row if quantity is 0
    if (unequippedRow.quantity <= 0) await unequippedRow.destroy();
    // Update character equipment
    const char = await Character.findOne({ where: { userId } });
    if (itemType === "weapon") {
      if (slot === "weapon1") char.equippedWeapon1Id = itemId;
      else if (slot === "weapon2") char.equippedWeapon2Id = itemId;
    } else if (itemType === "armor") {
      char.equippedArmorId = itemId;
    }
    await char.save();
    if (io) {
      io.to(`user:${userId}`).emit("hud:update", await char.toSafeJSON());
      const updatedInventory = await this.getUserInventory(userId);
      io.to(`user:${userId}`).emit("inventory:update", updatedInventory);
    }
    return { message: "equipped", slot, itemId };
  }

  // Unequip an item: move from equipped row to unequipped (merge if needed)
  static async unequipItem(userId, type, slot) {
    const itemType = this.canonicalType(type);
    if (!itemType) throw new Error("invalid type");
    // Find equipped row for slot
    const equippedRow = await InventoryItem.findOne({ where: { userId, itemType, equipped: true, slot } });
    if (!equippedRow) throw new Error("no equipped item in slot");
    // Find or create unequipped row
    let unequippedRow = await InventoryItem.findOne({ where: { userId, itemType, itemId: equippedRow.itemId, equipped: false } });
    if (unequippedRow) {
      unequippedRow.quantity += 1;
      await unequippedRow.save();
    } else {
      await InventoryItem.create({
        userId,
        itemType,
        itemId: equippedRow.itemId,
        equipped: false,
        slot: null,
        quantity: 1,
      });
    }
    // Remove equipped row
    await equippedRow.destroy();
    // Update character equipment
    const char = await Character.findOne({ where: { userId } });
    if (itemType === "weapon") {
      if (slot === "weapon1") char.equippedWeapon1Id = null;
      if (slot === "weapon2") char.equippedWeapon2Id = null;
    } else if (itemType === "armor") {
      char.equippedArmorId = null;
    }
    await char.save();
    if (io) {
      io.to(`user:${userId}`).emit("hud:update", await char.toSafeJSON());
      const updatedInventory = await this.getUserInventory(userId);
      io.to(`user:${userId}`).emit("inventory:update", updatedInventory);
    }
    return { message: "unequipped", itemType, slot };
  }

  // Sell an item: only unequipped, decrement quantity or delete row
  static async sellItem(userId, type, itemId, sellOption = 'quick') {
    const itemType = this.canonicalType(type);
    if (!itemType) throw new Error("invalid type");
    const row = await InventoryItem.findOne({ where: { userId, itemType, itemId, equipped: false } });
    if (!row || row.quantity < 1) throw new Error("item not owned");
    const refModel = this.modelFor(itemType);
    const ref = refModel ? await refModel.findByPk(itemId) : null;
    
    if (sellOption === 'quick') {
      // Quick sell for 100 money
      const sellPrice = 100;
      // Update character money
      const char = await Character.findOne({ where: { userId } });
      char.money += sellPrice;
      await char.save();
      // Decrement or delete
      row.quantity -= 1;
      if (row.quantity <= 0) await row.destroy();
      else await row.save();
      if (io) {
        io.to(`user:${userId}`).emit("hud:update", await char.toSafeJSON());
        const updatedInventory = await this.getUserInventory(userId);
        io.to(`user:${userId}`).emit("inventory:update", updatedInventory);
      }
      return { message: "sold", sellPrice, method: 'quick' };
    } else if (sellOption === 'blackmarket') {
      // Direct to blackmarket - create a listing automatically
      const { BlackMarketListing } = await import('../models/BlackMarketListing.js');
      const char = await Character.findOne({ where: { userId } });
      if (!char) throw new Error("character not found");
      
      // Calculate a reasonable price for blackmarket (higher than quick sell)
      const suggestedPrice = Math.max(150, Math.round((ref?.price || 100) * 0.5));
      
      // Create listing
      const listing = await BlackMarketListing.create({
        sellerId: char.id,
        itemType,
        itemId,
        quantity: 1,
        price: suggestedPrice,
        status: 'active',
        name: ref?.name || 'Unknown Item',
        imageUrl: ref?.imageUrl || null,
        rarity: ref?.rarity || 'common',
        stats: {
          damage: ref?.damage || null,
          def: ref?.def || null,
          hpBonus: ref?.hpBonus || null,
          energyBonus: ref?.energyBonus || null,
        },
      });
      
      // Remove item from inventory
      row.quantity -= 1;
      if (row.quantity <= 0) await row.destroy();
      else await row.save();
      
      return { 
        message: "listed", 
        listing, 
        method: 'blackmarket',
        suggestedPrice,
        message: `تم إدراج العنصر في السوق السوداء بسعر ${suggestedPrice} مال`
      };
    } else {
      throw new Error("invalid sell option");
    }
  }

  static async addItemToInventory(userId, type, itemId, quantity = 1) {
    const itemType = this.canonicalType(type);
    if (!itemType) throw new Error("invalid type");
    let row = await InventoryItem.findOne({ where: { userId, itemType, itemId, equipped: false } });
    if (row) {
      row.quantity += quantity;
      await row.save();
    } else {
      await InventoryItem.create({ userId, itemType, itemId, equipped: false, slot: null, quantity });
    }
    return true;
  }

  static async useSpecialItem(userId, itemId) {
    try {
      const result = await SpecialItemService.useSpecialItem(userId, itemId);
      return result;
    } catch (error) {
      console.error('[InventoryService] Error calling SpecialItemService.useSpecialItem:', error);
      throw error; // Re-throw the error so the controller can handle it properly
    }
  }
} 