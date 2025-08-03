import { SpecialItem } from '../models/SpecialItem.js';
import { InventoryItem } from '../models/Inventory.js';
import { Character } from '../models/Character.js';
import { CharacterService } from './CharacterService.js';
import { GangMember, Gang } from '../models/Gang.js';
import { Hospital, Jail } from '../models/Confinement.js';
import { io, emitNotification } from '../socket.js';
import { NotificationService } from './NotificationService.js';
import { Op } from 'sequelize';

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

    // Emit HUD and inventory updates
    if (io) {
      io.to(`user:${userId}`).emit("hud:update", await character.toSafeJSON());
      const { InventoryService } = await import('./InventoryService.js');
      const updatedInventory = await InventoryService.getUserInventory(userId);
      io.to(`user:${userId}`).emit("inventory:update", updatedInventory);
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

  static async useSpecialItem(userId, itemId, additionalData = {}) {
    try {
      const item = await SpecialItem.findByPk(itemId);
      if (!item) {
        throw new Error('العنصر غير موجود');
      }

      const character = await Character.findOne({ where: { userId } });
      if (!character) {
        throw new Error('الشخصية غير موجودة');
      }

      // Check level requirement for experience potions, gang bombs, and attack immunity
      if ((item.type === 'EXPERIENCE_POTION' || item.type === 'GANG_BOMB' || item.type === 'ATTACK_IMMUNITY' || item.type === 'CD_RESET') && character.level < item.levelRequired) {
        throw new Error(`يجب أن تكون المستوى ${item.levelRequired} على الأقل لاستخدام هذا العنصر`);
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

      if (effects.experience) {
        character.exp += effects.experience;
        effectApplied = true;
        
        // Trigger level-up logic
        await CharacterService.maybeLevelUp(character);
      }

      if (effects.nameChange) {
        // For name change items, we'll set a flag that the frontend can use
        // The actual name change will be handled by a separate endpoint
        effectApplied = true;
      }

      if (effects.attackImmunity) {
        // Attack immunity effect: provides protection against various attacks
        effectApplied = true;
        
        // Set immunity expiration time
        const immunityDuration = effects.duration || 3600; // Default 1 hour in seconds
        const immunityExpiresAt = new Date(Date.now() + immunityDuration * 1000);
        
        // Store immunity data in character (we'll add this field to the Character model)
        character.attackImmunityExpiresAt = immunityExpiresAt;
        
        // Send notification about immunity activation
        try {
          const immunityNotification = await NotificationService.createNotification(
            userId,
            'ATTACK_IMMUNITY_ACTIVATED',
            'تم تفعيل الحماية من الهجمات',
            `تم تفعيل الحماية من الهجمات لمدة ${Math.floor(immunityDuration / 60)} دقيقة. أنت محمي من الهجمات المباشرة وقنابل العصابة، لكن لا تزال عرضة للغاسين الشبح.`,
            { 
              reason: 'attack_immunity_activated', 
              duration: immunityDuration,
              expiresAt: immunityExpiresAt
            }
          );
          emitNotification(userId, immunityNotification);
        } catch (notificationError) {
          console.error('[SpecialItemService] Notification error for attack immunity:', notificationError);
        }
      }

      if (effects.cdReset) {
        // CD reset effect: immediately remove all cooldowns (jail, hospital, gym, crime)
        effectApplied = true;
        
        const now = Date.now();
        let resetCount = 0;
        let crimeReset = false;
        let gymReset = false;
        let jailReleased = false;
        let hospitalReleased = false;
        
        // Reset crime cooldown
        if (character.crimeCooldown && character.crimeCooldown > now) {
          character.crimeCooldown = 0;
          resetCount++;
          crimeReset = true;
        }
        
        // Reset gym cooldown
        if (character.gymCooldown && character.gymCooldown > now) {
          character.gymCooldown = 0;
          resetCount++;
          gymReset = true;
        }
        
        // Check and release from jail
        const { Jail } = await import('../models/Confinement.js');
        const jailRecord = await Jail.findOne({
          where: { 
            userId,
            releasedAt: { [Op.gt]: new Date() }
          }
        });
        
        if (jailRecord) {
          await jailRecord.destroy();
          resetCount++;
          jailReleased = true;
          
          // Emit jail leave event (consistent with other jail releases)
          if (io) {
            io.to(`user:${userId}`).emit('jail:leave', {
              reason: 'cd_reset_item'
            });
          }
        }
        
        // Check and release from hospital
        const { Hospital } = await import('../models/Confinement.js');
        const hospitalRecord = await Hospital.findOne({
          where: { 
            userId,
            releasedAt: { [Op.gt]: new Date() }
          }
        });
        
        if (hospitalRecord) {
          await hospitalRecord.destroy();
          resetCount++;
          hospitalReleased = true;
          
          // Emit hospital leave event (consistent with other hospital releases)
          if (io) {
            io.to(`user:${userId}`).emit('hospital:leave', {
              reason: 'cd_reset_item'
            });
          }
        }
        
        // Save character changes immediately after cooldown resets
        await character.save();
        
        // Send notification about CD reset
        try {
          let resetMessage = 'تم إعادة تعيين جميع أوقات الانتظار بنجاح!\n\n';
          resetMessage += '✅ تم إعادة تعيين:\n';
          
          if (crimeReset || gymReset) {
            resetMessage += '• أوقات الانتظار للجرائم والجيم\n';
          }
          if (jailReleased) {
            resetMessage += '• تم الإفراج من السجن\n';
          }
          if (hospitalReleased) {
            resetMessage += '• تم الخروج من المستشفى\n';
          }
          
          resetMessage += '\n🎯 يمكنك الآن ممارسة جميع الأنشطة بدون انتظار!';
          
          const cdResetNotification = await NotificationService.createNotification(
            userId,
            'CD_RESET_ACTIVATED',
            'تم إعادة تعيين أوقات الانتظار',
            resetMessage,
            { 
              reason: 'cd_reset_activated', 
              resetCount,
              crimeReset,
              gymReset,
              jailReleased,
              hospitalReleased
            }
          );
          emitNotification(userId, cdResetNotification);
        } catch (notificationError) {
          console.error('[SpecialItemService] Notification error for CD reset:', notificationError);
        }
      }

      if (effects.gangBomb) {
        // Gang bomb effect: put all gang members in hospital for 30 minutes
        effectApplied = true;
        
        // Get target gang ID from additional data
        const targetGangId = additionalData.targetGangId;
        if (!targetGangId) {
          throw new Error('يجب تحديد العصابة المستهدفة لاستخدام قنبلة العصابة');
        }
        
        // Get user's gang to prevent self-targeting (optional - user doesn't need to be in a gang)
        const userGangMember = await GangMember.findOne({
          where: { userId }
        });
        
        // Prevent self-targeting (only if user is in a gang)
        if (userGangMember && userGangMember.gangId === parseInt(targetGangId)) {
          throw new Error('لا يمكنك استهداف عصابة الخاصة بك');
        }
        
        // Get target gang info
        const targetGang = await Gang.findByPk(targetGangId);
        if (!targetGang) {
          throw new Error('العصابة المستهدفة غير موجودة');
        }
        
        // Get user info for notifications
        const userCharacter = await Character.findOne({ where: { userId } });
        const bomberName = userCharacter ? userCharacter.name : 'Unknown User';
        
        // Get all gang members of the target gang
        const gangMembers = await GangMember.findAll({
          where: { 
            gangId: targetGangId
          }
        });
        
        if (gangMembers.length === 0) {
          throw new Error('لا يوجد أعضاء آخرون في العصابة لاستهدافهم');
        }
        
        const hospitalTime = new Date();
        const hospitalStay = 30; // 30 minutes
        const hpLoss = 100;
        
        // Check if all members are already confined before proceeding
        let allConfinedCount = 0;
        for (const member of gangMembers) {
          const existingHospital = await Hospital.findOne({
            where: { 
              userId: member.userId,
              releasedAt: { [Op.gt]: hospitalTime }
            }
          });
          
          const existingJail = await Jail.findOne({
            where: { 
              userId: member.userId,
              releasedAt: { [Op.gt]: hospitalTime }
            }
          });
          
          if (existingHospital || existingJail) {
            allConfinedCount++;
          }
        }
        
        // If all members are already confined, don't waste the bomb
        if (allConfinedCount === gangMembers.length) {
          throw new Error('جميع أعضاء العصابة المستهدفة محتجزون بالفعل (مستشفى أو سجن). حاول مرة أخرى لاحقاً عندما يكون بعض الأعضاء متاحين.');
        }
        
        let hospitalizedCount = 0;
        let excludedCount = 0;
        
        // Put all gang members in hospital (excluding those already confined)
        for (const member of gangMembers) {
          try {
            // Check if member is already in hospital
            const existingHospital = await Hospital.findOne({
              where: { 
                userId: member.userId,
                releasedAt: { [Op.gt]: hospitalTime }
              }
            });
            
            // Check if member is already in jail
            const existingJail = await Jail.findOne({
              where: { 
                userId: member.userId,
                releasedAt: { [Op.gt]: hospitalTime }
              }
            });
            
            // Check if member has attack immunity
            const memberCharacter = await Character.findOne({
              where: { userId: member.userId }
            });
            
            const hasAttackImmunity = memberCharacter && 
              memberCharacter.attackImmunityExpiresAt && 
              new Date(memberCharacter.attackImmunityExpiresAt) > hospitalTime;
            
            // Skip if member is already in hospital, jail, or has attack immunity
            if (existingHospital || existingJail || hasAttackImmunity) {
              excludedCount++;
              
              // Send protection notification if member has attack immunity
              if (hasAttackImmunity) {
                try {
                  const protectionNotification = await NotificationService.createGangBombImmunityProtectedNotification(member.userId, targetGang.name, bomberName);
                  emitNotification(member.userId, protectionNotification);
                } catch (notificationError) {
                  console.error('[SpecialItemService] Gang bomb protection notification error:', notificationError);
                }
              }
              
              continue;
            }
            
            // Put member in hospital
            const hospitalRecord = await Hospital.create({
              userId: member.userId,
              minutes: hospitalStay,
              hpLoss: hpLoss,
              healRate: 200, // Not used anymore but kept for compatibility
              startedAt: hospitalTime,
              releasedAt: new Date(hospitalTime.getTime() + hospitalStay * 60_000),
            });
            
            hospitalizedCount++;
            
            // Emit hospital enter event
            if (io) {
              io.to(`user:${member.userId}`).emit('hospital:enter', {
                releaseAt: hospitalRecord.releasedAt,
                reason: 'gang_bomb',
              });
            }
            
                                // Send notification to the hospitalized member
            try {
              const notification = await NotificationService.createNotification(
                member.userId,
                'GANG_BOMB_HOSPITALIZED',
                'تم إدخالك المستشفى',
                `تم إدخالك المستشفى بواسطة قنبلة عصابة من ${bomberName}${userGangMember ? ' من عصابة أخرى' : ''}`,
                { reason: 'gang_bomb', duration: hospitalStay, bomberName, targetGangName: targetGang.name }
              );
              emitNotification(member.userId, notification);
            } catch (notificationError) {
              console.error('[SpecialItemService] Notification error for gang bomb:', notificationError);
            }
          } catch (memberError) {
            console.error(`[SpecialItemService] Error hospitalizing gang member ${member.userId}:`, memberError);
            // Continue with other members even if one fails
          }
        }
        
        // Send notification to gang leader about the bombing
        if (targetGang.leaderId !== userId) {
          try {
            const leaderNotification = await NotificationService.createNotification(
              targetGang.leaderId,
              'GANG_BOMBED',
              'تم قصف العصابة',
              `تم قصف عصابة ${targetGang.name} بواسطة ${bomberName}${userGangMember ? ' من عصابة أخرى' : ''}. تم إدخال ${hospitalizedCount} عضو المستشفى لمدة 30 دقيقة${excludedCount > 0 ? ` (تم استبعاد ${excludedCount} عضو كانوا محتجزين مسبقاً)` : ''}`,
              { 
                reason: 'gang_bombed', 
                gangName: targetGang.name, 
                bomberName, 
                hospitalizedCount, 
                excludedCount 
              }
            );
            emitNotification(targetGang.leaderId, leaderNotification);
          } catch (notificationError) {
            console.error('[SpecialItemService] Notification error for gang leader:', notificationError);
          }
        }
        
        // Send detailed notification to the bomber about the results
        try {
          const totalMembers = gangMembers.length;
          const successRate = totalMembers > 0 ? Math.round((hospitalizedCount / totalMembers) * 100) : 0;
          
          let bomberMessage = `تم استخدام قنبلة العصابة بنجاح ضد عصابة "${targetGang.name}"!\n\n`;
          bomberMessage += `📊 النتائج:\n`;
          bomberMessage += `• تم إدخال ${hospitalizedCount} عضو المستشفى لمدة 30 دقيقة\n`;
          bomberMessage += `• تم استبعاد ${excludedCount} عضو كانوا محتجزين مسبقاً\n`;
          bomberMessage += `• إجمالي الأعضاء: ${totalMembers}\n`;
          bomberMessage += `• نسبة النجاح: ${successRate}%\n\n`;
          bomberMessage += `🎯 العصابة المستهدفة: ${targetGang.name}`;
          
          const bomberNotification = await NotificationService.createNotification(
            userId,
            'GANG_BOMB_USED',
            'تم استخدام قنبلة العصابة بنجاح',
            bomberMessage,
            { 
              reason: 'gang_bomb_used', 
              targetGangName: targetGang.name, 
              hospitalizedCount, 
              excludedCount,
              totalMembers,
              successRate
            }
          );
          emitNotification(userId, bomberNotification);
        } catch (notificationError) {
          console.error('[SpecialItemService] Notification error for bomber:', notificationError);
        }
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

      // Emit HUD and inventory updates
      if (io) {
        io.to(`user:${userId}`).emit("hud:update", await character.toSafeJSON());
        const { InventoryService } = await import('./InventoryService.js');
        const updatedInventory = await InventoryService.getUserInventory(userId);
        io.to(`user:${userId}`).emit("inventory:update", updatedInventory);
      }
      
      return {
        message: 'تم استخدام العنصر بنجاح',
        item: item,
        effects: effects,
        effectApplied
      };
    } catch (error) {
      console.error('[SpecialItemService] Error in useSpecialItem:', error);
      throw error;
    }
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

    // Emit HUD and inventory updates
    if (io) {
      io.to(`user:${userId}`).emit("hud:update", await character.toSafeJSON());
      const { InventoryService } = await import('./InventoryService.js');
      const updatedInventory = await InventoryService.getUserInventory(userId);
      io.to(`user:${userId}`).emit("inventory:update", updatedInventory);
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
    } else if (itemData.type === 'EXPERIENCE_POTION') {
      effect = { health: 0, energy: 0, experience: itemData.effect.experience || 0, duration: 0 };
    } else if (itemData.type === 'NAME_CHANGE') {
      effect = { health: 0, energy: 0, experience: 0, nameChange: true, duration: 0 };
    } else if (itemData.type === 'GANG_BOMB') {
      effect = { health: 0, energy: 0, experience: 0, gangBomb: true, duration: 0 };
    } else if (itemData.type === 'ATTACK_IMMUNITY') {
      effect = { health: 0, energy: 0, experience: 0, attackImmunity: true, duration: itemData.effect.duration || 3600 };
    } else if (itemData.type === 'CD_RESET') {
      effect = { health: 0, energy: 0, experience: 0, cdReset: true, duration: 0 };
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