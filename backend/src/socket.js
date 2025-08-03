// -----------------------------------------------------------------------------
//  backend/src/socket.js  –  unified Socket.IO bootstrap (await fixes)
// -----------------------------------------------------------------------------
import { Server } from 'socket.io';
import admin from 'firebase-admin';
import { Character } from './models/Character.js';
import { Message } from './models/Message.js';
import { GlobalMessage } from './models/GlobalMessage.js';
import { User } from './models/User.js';
import { Friendship } from './models/Friendship.js';
import { InventoryItem } from './models/Inventory.js';
import { BankAccount } from './models/Bank.js';
import { Task } from './models/Task.js';
import { Gang } from './models/Gang.js';
import { Statistic } from './models/Statistic.js';
import { Op } from 'sequelize';
// Item import removed - using InventoryItem instead
import { Crime } from './models/Crime.js';
import { Fight } from './models/Fight.js';
import { BloodContract } from './models/index.js';
import { Job } from './models/Job.js';
import { MinistryMission } from './models/MinistryMission.js';
import { Car } from './models/Car.js';
import { Dog } from './models/Dog.js';
import { House } from './models/House.js';
import { BlackMarketItem } from './models/BlackMarket.js';
import { Weapon, Armor } from './models/Shop.js';
import { SpecialItem } from './models/SpecialItem.js';
import { LoginGift } from './models/LoginGift.js';

let io = null;

export function initSocket(server) {
  io = new Server(server, {
    path: '/ws',
    cors: { 
      origin: true, // Allow all origins for now
      credentials: true 
    },
    transports: ['websocket', 'polling'], // Add polling as fallback
    pingTimeout: 60000, // Increase ping timeout
    pingInterval: 25000, // Increase ping interval
    upgradeTimeout: 10000, // Increase upgrade timeout
    allowUpgrades: true,
    maxHttpBufferSize: 1e6, // 1MB buffer size
  });

  io.on('connection', async (socket) => {
    const token = socket.handshake.auth?.token;
    
    if (!token) {
      return socket.disconnect();
    }

    try {
      // Verify Firebase ID token
      const decodedToken = await admin.auth().verifyIdToken(token);
      const firebaseUid = decodedToken.uid;
      
      // Get user from database by Firebase UID
      const { User } = await import('./models/User.js');
      const user = await User.findOne({ where: { firebaseUid } });
      
      if (!user) {
        return socket.disconnect();
      }
      
      socket.data.userId = user.id;
      socket.join(`user:${user.id}`);
      
      // User connected successfully

      /* helper to push one HUD snapshot */
      const pushHud = async () => {
        try {
          // Add timeout to prevent hanging
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('HUD update timed out')), 10000)
          );
          
          const hudPromise = (async () => {
            const char = await Character.findOne({ 
              where: { userId },
              include: [{ model: User, attributes: ['id', 'username', 'avatarUrl', 'isAdmin', 'isVip'] }]
            });
            if (char) {
              const hudData = await char.toSafeJSON();
              
              // Get hospital and jail status with timeout
              const { ConfinementService } = await import('./services/ConfinementService.js');
              const [hospitalStatus, jailStatus] = await Promise.all([
                ConfinementService.getHospitalStatus(userId),
                ConfinementService.getJailStatus(userId)
              ]);
              
              // Calculate cooldowns
              const now = Date.now();
              const crimeCooldown = char.crimeCooldown && char.crimeCooldown > now 
                ? Math.floor((char.crimeCooldown - now) / 1000) 
                : 0;
              const gymCooldown = char.gymCooldown && char.gymCooldown > now 
                ? Math.floor((char.gymCooldown - now) / 1000) 
                : 0;
              
              // Add status data to HUD
              const enhancedHudData = {
                ...hudData,
                hospitalStatus,
                jailStatus,
                crimeCooldown,
                gymCooldown
              };
              
              socket.emit('hud:update', enhancedHudData);
            }
          })();
          
          await Promise.race([hudPromise, timeoutPromise]);
        } catch (error) {
          console.error(`[Socket] Error pushing HUD for user ${userId}:`, error.message);
        }
      };

      /* helper to push profile data updates */
      const pushProfileUpdate = async (targetUserId = userId) => {
        try {
          const char = await Character.findOne({ 
            where: { userId: targetUserId },
            include: [{ model: User, attributes: ['id', 'username', 'avatarUrl', 'isAdmin', 'isVip'] }]
          });
          if (char) {
            const profileData = await char.toSafeJSON();
            io.to(`user:${targetUserId}`).emit('profile:update', profileData);
          }
        } catch (error) {
          console.error(`[Socket] Error pushing profile update for user ${targetUserId}:`, error.message);
        }
      };

      /* helper to push friendship status updates */
      const pushFriendshipUpdate = async (targetUserId) => {
        try {
          // Check if users are friends
          const friendship = await Friendship.findOne({
            where: {
              [Op.or]: [
                { requesterId: userId, addresseeId: targetUserId },
                { requesterId: targetUserId, addresseeId: userId }
              ],
              status: 'accepted'
            }
          });
          
          // Check for pending requests
          const pendingSent = await Friendship.findOne({
            where: { requesterId: userId, addresseeId: targetUserId, status: 'pending' }
          });
          
          const pendingReceived = await Friendship.findOne({
            where: { requesterId: targetUserId, addresseeId: userId, status: 'pending' }
          });
          
          const friendshipStatus = {
            isFriend: !!friendship,
            pendingStatus: pendingSent ? 'sent' : pendingReceived ? 'received' : null
          };
          
          // Emit to both users
          io.to(`user:${userId}`).emit('friendship:update', { targetUserId, ...friendshipStatus });
          io.to(`user:${targetUserId}`).emit('friendship:update', { targetUserId: userId, ...friendshipStatus });
        } catch (error) {
          console.error(`[Socket] Error pushing friendship update:`, error.message);
        }
      };

      /* helper to push inventory updates */
      const pushInventoryUpdate = async (targetUserId = userId) => {
        try {
          const inventory = await InventoryItem.findAll({
            where: { userId: targetUserId }
          });
          
          io.to(`user:${targetUserId}`).emit('inventory:update', inventory);
        } catch (error) {
          console.error(`[Socket] Error pushing inventory update for user ${targetUserId}:`, error.message);
        }
      };

      /* helper to push bank updates */
      const pushBankUpdate = async (targetUserId = userId) => {
        try {
          const bank = await BankAccount.findOne({ where: { userId: targetUserId } });
          if (bank) {
            io.to(`user:${targetUserId}`).emit('bank:update', bank);
          }
        } catch (error) {
          console.error(`[Socket] Error pushing bank update for user ${targetUserId}:`, error.message);
        }
      };

      /* helper to push task updates */
      const pushTaskUpdate = async (targetUserId = userId) => {
        try {
          // Tasks are global catalog items, not user-specific
          const tasks = await Task.findAll({ where: { isActive: true } });
          io.to(`user:${targetUserId}`).emit('tasks:update', tasks);
        } catch (error) {
          console.error(`[Socket] Error pushing task update for user ${targetUserId}:`, error.message);
        }
      };

      /* helper to push gang updates */
      const pushGangUpdate = async (gangId) => {
        try {
          const gang = await Gang.findByPk(gangId, {
            include: [{ model: Character, as: 'members' }]
          });
          if (gang) {
            // Emit to all gang members
            gang.members.forEach(member => {
              io.to(`user:${member.userId}`).emit('gang:update', gang);
            });
          }
        } catch (error) {
          console.error(`[Socket] Error pushing gang update for gang ${gangId}:`, error.message);
        }
      };

      /* helper to push rankings update */
      const pushRankingsUpdate = async () => {
        try {
          const { RankingService } = await import('./services/RankingService.js');
          const rankings = await RankingService.getTopPlayers();
          io.emit('rankings:update', rankings);
        } catch (error) {
          console.error(`[Socket] Error pushing rankings update:`, error.message);
        }
      };

      /* helper to push crime updates */
      const pushCrimeUpdate = async (targetUserId = userId) => {
        try {
          const char = await Character.findOne({ where: { userId: targetUserId } });
          if (char) {
            const now = Date.now();
            const crimeCooldown = char.crimeCooldown && char.crimeCooldown > now 
              ? Math.floor((char.crimeCooldown - now) / 1000) 
              : 0;
            
            io.to(`user:${targetUserId}`).emit('crime:update', {
              crimeCooldown,
              energy: char.energy,
              maxEnergy: char.maxEnergy
            });
          }
        } catch (error) {
          console.error(`[Socket] Error pushing crime update for user ${targetUserId}:`, error.message);
        }
      };

      /* helper to push fight updates */
      const pushFightUpdate = async (targetUserId = userId) => {
        try {
          const char = await Character.findOne({ where: { userId: targetUserId } });
          if (char) {
            io.to(`user:${targetUserId}`).emit('fight:update', {
              hp: char.hp,
              maxHp: char.maxHp,
              fame: char.fame
            });
          }
        } catch (error) {
          console.error(`[Socket] Error pushing fight update for user ${targetUserId}:`, error.message);
        }
      };

      /* helper to push blood contract updates */
      const pushBloodContractUpdate = async (targetUserId = userId) => {
        try {
          const contracts = await BloodContract.findAll({
            where: {
              [Op.or]: [
                { posterId: targetUserId },
                { targetId: targetUserId }
              ],
              status: { [Op.ne]: 'completed' }
            },
            include: [
              { model: User, as: 'Poster', attributes: ['id', 'username', 'avatarUrl'] },
              { model: User, as: 'Target', attributes: ['id', 'username', 'avatarUrl'] },
              { model: User, as: 'Assassin', attributes: ['id', 'username', 'avatarUrl'] }
            ],
            order: [['createdAt', 'DESC']]
          });
          
          const formattedContracts = contracts.map(contract => ({
            id: contract.id,
            posterId: contract.posterId,
            targetId: contract.targetId,
            assassinId: contract.assassinId,
            amount: contract.amount,
            status: contract.status,
            expiresAt: contract.expiresAt,
            createdAt: contract.createdAt,
            poster: contract.Poster ? {
              id: contract.Poster.id,
              username: contract.Poster.username,
              avatarUrl: contract.Poster.avatarUrl
            } : null,
            target: contract.Target ? {
              id: contract.Target.id,
              username: contract.Target.username,
              avatarUrl: contract.Target.avatarUrl
            } : null,
            assassin: contract.Assassin ? {
              id: contract.Assassin.id,
              username: contract.Assassin.username,
              avatarUrl: contract.Assassin.avatarUrl
            } : null
          }));
          
          io.to(`user:${targetUserId}`).emit('bloodContract:update', formattedContracts);
        } catch (error) {
          console.error('[Socket] Error pushing blood contract update:', error);
        }
      };

      /* helper to push job updates */
      const pushJobUpdate = async (targetUserId = userId) => {
        try {
          const jobs = await Job.findAll({ where: { userId: targetUserId } });
          io.to(`user:${targetUserId}`).emit('jobs:update', jobs);
        } catch (error) {
          console.error(`[Socket] Error pushing job update for user ${targetUserId}:`, error.message);
        }
      };

      /* helper to push ministry mission updates */
      const pushMinistryMissionUpdate = async (targetUserId = userId) => {
        try {
          // Ministry missions are global catalog items, not user-specific
          const missions = await MinistryMission.findAll({ where: { isActive: true } });
          io.to(`user:${targetUserId}`).emit('ministryMission:update', missions);
        } catch (error) {
          console.error(`[Socket] Error pushing ministry mission update for user ${targetUserId}:`, error.message);
        }
      };

      /* helper to push car updates */
      const pushCarUpdate = async (targetUserId = userId) => {
        try {
          // Cars are global catalog items, not user-specific
          const cars = await Car.findAll();
          io.to(`user:${targetUserId}`).emit('cars:update', cars);
        } catch (error) {
          console.error(`[Socket] Error pushing car update for user ${targetUserId}:`, error.message);
        }
      };

      /* helper to push dog updates */
      const pushDogUpdate = async (targetUserId = userId) => {
        try {
          // Dogs are global catalog items, not user-specific
          const dogs = await Dog.findAll();
          io.to(`user:${targetUserId}`).emit('dogs:update', dogs);
        } catch (error) {
          console.error(`[Socket] Error pushing dog update for user ${targetUserId}:`, error.message);
        }
      };

      /* helper to push house updates */
      const pushHouseUpdate = async (targetUserId = userId) => {
        try {
          // Houses are global catalog items, not user-specific
          const houses = await House.findAll();
          io.to(`user:${targetUserId}`).emit('houses:update', houses);
        } catch (error) {
          console.error(`[Socket] Error pushing house update for user ${targetUserId}:`, error.message);
        }
      };

      /* helper to push black market updates */
      const pushBlackMarketUpdate = async () => {
        try {
          const items = await BlackMarketItem.findAll({ where: { isAvailable: true } });
          io.emit('blackMarket:update', items);
        } catch (error) {
          console.error(`[Socket] Error pushing black market update:`, error.message);
        }
      };

      /* helper to push shop updates */
      const pushShopUpdate = async () => {
        try {
          const weapons = await Weapon.findAll();
          const armors = await Armor.findAll();
          const items = [...weapons, ...armors];
          io.emit('shop:update', items);
        } catch (error) {
          console.error(`[Socket] Error pushing shop update:`, error.message);
        }
      };

      /* helper to push special shop updates */
      const pushSpecialShopUpdate = async () => {
        try {
          const items = await SpecialItem.findAll({ where: { isAvailable: true } });
          io.emit('specialShop:update', items);
        } catch (error) {
          console.error(`[Socket] Error pushing special shop update:`, error.message);
        }
      };

      /* helper to push login gift updates */
      const pushLoginGiftUpdate = async (targetUserId = userId) => {
        try {
          // Login gifts are global catalog items, not user-specific
          const gifts = await LoginGift.findAll({ where: { isActive: true } });
          io.to(`user:${targetUserId}`).emit('loginGift:update', gifts);
        } catch (error) {
          console.error(`[Socket] Error pushing login gift update for user ${targetUserId}:`, error.message);
        }
      };

      /* initial snapshot + 5-second heartbeat */
      await pushHud();
      const tick = setInterval(pushHud, 5000);

      /* manual refresh from client */
      socket.on('hud:request', async () => {
        try {
          await pushHud();
        } catch (error) {
          console.error(`[Socket] Error handling hud:request for user ${userId}:`, error.message);
        }
      });

      // Test event handler for debugging
      socket.on('test', (data) => {
        io.to(`user:${userId}`).emit('test_response', { message: 'Test response received', data });
      });

      // --- Messaging system ---
      socket.on('join', (userId) => {
        socket.join(`user_${userId}`);
      });

      socket.on('send_message', async (data) => {
        try {
          const { senderId, receiverId, content } = data;
          // Save message to DB
          const message = await Message.create({ senderId, receiverId, content });
          // Emit to receiver if online
          io.to(`user_${receiverId}`).emit('receive_message', message);
          // Optionally, emit to sender for confirmation
          socket.emit('message_sent', message);
        } catch (error) {
          console.error(`[Socket] Error sending message:`, error.message);
          socket.emit('message_error', { error: 'Failed to send message' });
        }
      });

      // --- Edit message ---
      socket.on('edit_message', async ({ messageId, newContent }, callback) => {
        try {
          const message = await Message.findByPk(messageId);
          if (!message) return callback && callback({ error: 'Message not found' });
          if (message.senderId !== userId) return callback && callback({ error: 'Unauthorized' });
          if (!newContent || newContent.trim().length === 0) return callback && callback({ error: 'Message cannot be empty' });
          message.content = newContent.trim();
          message.edited = true;
          message.editedAt = new Date();
          await message.save();
          io.to(`user_${message.senderId}`).emit('message_edited', message);
          io.to(`user_${message.receiverId}`).emit('message_edited', message);
          callback && callback({ success: true });
        } catch (error) {
          callback && callback({ error: error.message });
        }
      });

      // --- Delete message (soft delete) ---
      socket.on('delete_message', async ({ messageId }, callback) => {
        try {
          const message = await Message.findByPk(messageId);
          if (!message) return callback && callback({ error: 'Message not found' });
          if (message.senderId !== userId) return callback && callback({ error: 'Unauthorized' });
          message.deleted = true;
          await message.save();
          io.to(`user_${message.senderId}`).emit('message_deleted', { messageId });
          io.to(`user_${message.receiverId}`).emit('message_deleted', { messageId });
          callback && callback({ success: true });
        } catch (error) {
          callback && callback({ error: error.message });
        }
      });

      // --- Emoji reactions ---
      socket.on('add_message_reaction', async ({ messageId, emoji }, callback) => {
        try {
          const message = await Message.findByPk(messageId);
          if (!message) return callback && callback({ error: 'Message not found' });
          let reactions = message.reactions || {};
          if (!reactions[emoji]) reactions[emoji] = [];
          if (!reactions[emoji].includes(userId)) {
            reactions[emoji].push(userId);
            message.reactions = reactions;
            await message.save();
            io.to(`user_${message.senderId}`).emit('message_reacted', message);
            io.to(`user_${message.receiverId}`).emit('message_reacted', message);
          }
          callback && callback({ success: true });
        } catch (error) {
          callback && callback({ error: error.message });
        }
      });
      socket.on('remove_message_reaction', async ({ messageId, emoji }, callback) => {
        try {
          const message = await Message.findByPk(messageId);
          if (!message) return callback && callback({ error: 'Message not found' });
          let reactions = message.reactions || {};
          if (reactions[emoji]) {
            reactions[emoji] = reactions[emoji].filter(id => id !== userId);
            if (reactions[emoji].length === 0) delete reactions[emoji];
            message.reactions = reactions;
            await message.save();
            io.to(`user_${message.senderId}`).emit('message_reacted', message);
            io.to(`user_${message.receiverId}`).emit('message_reacted', message);
          }
          callback && callback({ success: true });
        } catch (error) {
          callback && callback({ error: error.message });
        }
      });

      // --- Global Chat System ---
      // --- Online Global Chat Users Counter ---
      const onlineGlobalChatUsers = new Set();

      socket.on('join_global_chat', async () => {
        socket.join('global_chat');
        onlineGlobalChatUsers.add(userId);
        io.to('global_chat').emit('global_chat_users_count', onlineGlobalChatUsers.size);
      });

      socket.on('leave_global_chat', () => {
        socket.leave('global_chat');
        onlineGlobalChatUsers.delete(userId);
        io.to('global_chat').emit('global_chat_users_count', onlineGlobalChatUsers.size);
      });

      socket.on('send_global_message', async (data) => {
        try {
          const { content } = data;
          const char = await Character.findOne({ where: { userId } });
          if (!char) return socket.emit('global_message_error', { error: 'Character not found' });
          
          const message = await GlobalMessage.create({
            userId,
            content,
            characterName: char.name
          });
          
          const fullMessage = {
            ...message.toJSON(),
            username: char.User?.username || 'Unknown'
          };
          
          io.to('global_chat').emit('global_message', fullMessage);
        } catch (error) {
          console.error(`[Socket] Error sending global message:`, error.message);
          socket.emit('global_message_error', { error: 'Failed to send message' });
        }
      });

      // --- Friendship System ---
      socket.on('friendship:add', async (data) => {
        try {
          const { friendId } = data;
          const friendship = await Friendship.create({
            requesterId: userId,
            addresseeId: friendId,
            status: 'pending'
          });
          
          // Push updates to both users
          await pushFriendshipUpdate(friendId);
        } catch (error) {
          console.error(`[Socket] Error adding friendship:`, error.message);
        }
      });

      socket.on('friendship:accept', async (data) => {
        try {
          const { friendshipId } = data;
          const friendship = await Friendship.findByPk(friendshipId);
          if (friendship && friendship.addresseeId === userId) {
            friendship.status = 'accepted';
            await friendship.save();
            
            // Push updates to both users
            await pushFriendshipUpdate(friendship.requesterId);
          }
        } catch (error) {
          console.error(`[Socket] Error accepting friendship:`, error.message);
        }
      });

      socket.on('friendship:remove', async (data) => {
        try {
          const { friendId } = data;
          await Friendship.destroy({
            where: {
              [Op.or]: [
                { requesterId: userId, addresseeId: friendId },
                { requesterId: friendId, addresseeId: userId }
              ]
            }
          });
          
          // Push updates to both users
          await pushFriendshipUpdate(friendId);
        } catch (error) {
          console.error(`[Socket] Error removing friendship:`, error.message);
        }
      });

      // --- Profile Updates ---
      socket.on('profile:request', async (data) => {
        try {
          const { targetUserId } = data;
          await pushProfileUpdate(targetUserId || userId);
        } catch (error) {
          console.error(`[Socket] Error handling profile request:`, error.message);
        }
      });

      // --- Inventory Updates ---
      socket.on('inventory:request', async () => {
        try {
          await pushInventoryUpdate();
        } catch (error) {
          console.error(`[Socket] Error handling inventory request:`, error.message);
        }
      });

      // --- Bank Updates ---
      socket.on('bank:request', async () => {
        try {
          await pushBankUpdate();
        } catch (error) {
          console.error(`[Socket] Error handling bank request:`, error.message);
        }
      });

      // --- Task Updates ---
      socket.on('tasks:request', async () => {
        try {
          await pushTaskUpdate();
        } catch (error) {
          console.error(`[Socket] Error handling tasks request:`, error.message);
        }
      });

      // --- Gang Updates ---
      socket.on('gang:request', async (data) => {
        try {
          const { gangId } = data;
          await pushGangUpdate(gangId);
        } catch (error) {
          console.error(`[Socket] Error handling gang request:`, error.message);
        }
      });

      // --- Rankings Updates ---
      socket.on('rankings:request', async () => {
        try {
          await pushRankingsUpdate();
        } catch (error) {
          console.error(`[Socket] Error handling rankings request:`, error.message);
        }
      });

      // --- Crime Updates ---
      socket.on('crime:request', async () => {
        try {
          await pushCrimeUpdate();
        } catch (error) {
          console.error(`[Socket] Error handling crime request:`, error.message);
        }
      });

      // --- Fight Updates ---
      socket.on('fight:request', async () => {
        try {
          await pushFightUpdate();
        } catch (error) {
          console.error(`[Socket] Error handling fight request:`, error.message);
        }
      });

      // --- Blood Contract Updates ---
      socket.on('bloodContract:request', async () => {
        try {
          await pushBloodContractUpdate();
        } catch (error) {
          console.error(`[Socket] Error handling blood contract request:`, error.message);
        }
      });

      // --- Job Updates ---
      socket.on('jobs:request', async () => {
        try {
          await pushJobUpdate();
        } catch (error) {
          console.error(`[Socket] Error handling jobs request:`, error.message);
        }
      });

      // --- Ministry Mission Updates ---
      socket.on('ministryMission:request', async () => {
        try {
          await pushMinistryMissionUpdate();
        } catch (error) {
          console.error(`[Socket] Error handling ministry mission request:`, error.message);
        }
      });

      // --- Car Updates ---
      socket.on('cars:request', async () => {
        try {
          await pushCarUpdate();
        } catch (error) {
          console.error(`[Socket] Error handling cars request:`, error.message);
        }
      });

      // --- Dog Updates ---
      socket.on('dogs:request', async () => {
        try {
          await pushDogUpdate();
        } catch (error) {
          console.error(`[Socket] Error handling dogs request:`, error.message);
        }
      });

      // --- House Updates ---
      socket.on('houses:request', async () => {
        try {
          await pushHouseUpdate();
        } catch (error) {
          console.error(`[Socket] Error handling houses request:`, error.message);
        }
      });

      // --- Black Market Updates ---
      socket.on('blackMarket:request', async () => {
        try {
          await pushBlackMarketUpdate();
        } catch (error) {
          console.error(`[Socket] Error handling black market request:`, error.message);
        }
      });

      // --- Shop Updates ---
      socket.on('shop:request', async () => {
        try {
          await pushShopUpdate();
        } catch (error) {
          console.error(`[Socket] Error handling shop request:`, error.message);
        }
      });

      // --- Special Shop Updates ---
      socket.on('specialShop:request', async () => {
        try {
          await pushSpecialShopUpdate();
        } catch (error) {
          console.error(`[Socket] Error handling special shop request:`, error.message);
        }
      });

      // --- Login Gift Updates ---
      socket.on('loginGift:request', async () => {
        try {
          await pushLoginGiftUpdate();
        } catch (error) {
          console.error(`[Socket] Error handling login gift request:`, error.message);
        }
      });

      // --- Game News Updates (HTTP replacement) ---
      socket.on('gameNews:request', async () => {
        try {
          const { GameNewsService } = await import('./services/GameNewsService.js');
          const news = await GameNewsService.getRecentNews();
          io.to(`user:${userId}`).emit('gameNews:update', news);
        } catch (error) {
          console.error(`[Socket] Error handling game news request:`, error.message);
        }
      });

      // --- Confinement Status Updates (HTTP replacement) ---
      socket.on('confinement:request', async () => {
        try {
          const { ConfinementService } = await import('./services/ConfinementService.js');
          const hospitalStatus = await ConfinementService.getHospitalStatus(userId);
          const jailStatus = await ConfinementService.getJailStatus(userId);
          
          io.to(`user:${userId}`).emit('confinement:update', {
            hospital: hospitalStatus,
            jail: jailStatus
          });
        } catch (error) {
          console.error(`[Socket] Error handling confinement request:`, error.message);
        }
      });

      // --- Crimes List Updates (HTTP replacement) ---
      socket.on('crimes:request', async () => {
        try {
          const { CrimeService } = await import('./services/CrimeService.js');
          const crimes = await CrimeService.getAllCrimes();
          io.to(`user:${userId}`).emit('crimes:update', crimes);
        } catch (error) {
          console.error(`[Socket] Error handling crimes request:`, error.message);
        }
      });

      // --- Friendship List Updates (HTTP replacement) ---
      socket.on('friendshipList:request', async () => {
        try {
          const friendships = await Friendship.findAll({
            where: {
              [Op.or]: [
                { requesterId: userId },
                { addresseeId: userId }
              ],
              status: 'accepted'
            },
            include: [
              { model: User, as: 'requester', attributes: ['id', 'username', 'avatarUrl'] },
              { model: User, as: 'addressee', attributes: ['id', 'username', 'avatarUrl'] }
            ]
          });
          
          io.to(`user:${userId}`).emit('friendshipList:update', friendships);
        } catch (error) {
          console.error(`[Socket] Error handling friendship list request:`, error.message);
        }
      });

      // --- Pending Friendships Updates (HTTP replacement) ---
      socket.on('pendingFriendships:request', async () => {
        try {
          const pendingFriendships = await Friendship.findAll({
            where: {
              addresseeId: userId,
              status: 'pending'
            },
            include: [
              { model: User, as: 'requester', attributes: ['id', 'username', 'avatarUrl'] }
            ]
          });
          
          io.to(`user:${userId}`).emit('pendingFriendships:update', pendingFriendships);
        } catch (error) {
          console.error(`[Socket] Error handling pending friendships request:`, error.message);
        }
      });

      // --- Messages Updates (HTTP replacement) ---
      socket.on('messages:request', async (data) => {
        try {
          const { targetUserId } = data;
          const messages = await Message.findAll({
            where: {
              [Op.or]: [
                { senderId: userId, receiverId: targetUserId },
                { senderId: targetUserId, receiverId: userId }
              ]
            },
            order: [['createdAt', 'ASC']]
          });
          
          io.to(`user:${userId}`).emit('messages:update', messages);
        } catch (error) {
          console.error(`[Socket] Error handling messages request:`, error.message);
        }
      });

      // --- Global Chat Messages Updates (HTTP replacement) ---
      socket.on('globalChatMessages:request', async () => {
        try {
          const messages = await GlobalMessage.findAll({
            order: [['createdAt', 'DESC']],
            limit: 50,
            include: [
              { model: User, attributes: ['id', 'username', 'avatarUrl', 'isAdmin', 'isVip'] }
            ]
          });
          
          io.to(`user:${userId}`).emit('globalChatMessages:update', messages);
        } catch (error) {
          console.error(`[Socket] Error handling global chat messages request:`, error.message);
        }
      });

      // --- Unread Messages Count Updates (HTTP replacement) ---
      socket.on('unreadMessagesCount:request', async () => {
        try {
          const count = await Message.count({
            where: {
              receiverId: userId,
              isRead: false
            }
          });
          
          io.to(`user:${userId}`).emit('unreadMessagesCount:update', count);
        } catch (error) {
          console.error(`[Socket] Error handling unread messages count request:`, error.message);
        }
      });

      // --- Unclaimed Tasks Count Updates (HTTP replacement) ---
      socket.on('unclaimedTasksCount:request', async () => {
        try {
          const { TaskService } = await import('./services/TaskService.js');
          const count = await TaskService.getUnclaimedTasksCount(userId);
          io.to(`user:${userId}`).emit('unclaimedTasksCount:update', count);
        } catch (error) {
          console.error(`[Socket] Error handling unclaimed tasks count request:`, error.message);
        }
      });

      // --- Friend Requests Count Updates (HTTP replacement) ---
      socket.on('friendRequestsCount:request', async () => {
        try {
          const count = await Friendship.count({
            where: {
              addresseeId: userId,
              status: 'pending'
            }
          });
          
          io.to(`user:${userId}`).emit('friendRequestsCount:update', count);
        } catch (error) {
          console.error(`[Socket] Error handling friend requests count request:`, error.message);
        }
      });

      // --- Notifications Count Updates (HTTP replacement) ---
      socket.on('notificationsCount:request', async () => {
        try {
          const { NotificationService } = await import('./services/NotificationService.js');
          const count = await NotificationService.getUnreadCount(userId);
          io.to(`user:${userId}`).emit('notificationsCount:update', count);
        } catch (error) {
          console.error(`[Socket] Error handling notifications count request:`, error.message);
        }
      });

      // --- Intro Status Updates (HTTP replacement) ---
      socket.on('introStatus:request', async () => {
        try {
          const user = await User.findByPk(userId);
          const introStatus = {
            hasCompletedIntro: user?.hasCompletedIntro || false,
            introStep: user?.introStep || 0
          };
          
          io.to(`user:${userId}`).emit('introStatus:update', introStatus);
        } catch (error) {
          console.error(`[Socket] Error handling intro status request:`, error.message);
        }
      });

      // --- Profile Updates (HTTP replacement) ---
      socket.on('profile:request', async (data) => {
        try {
          const { targetUserId } = data;
          const char = await Character.findOne({ 
            where: { userId: targetUserId || userId },
            include: [{ model: User, attributes: ['id', 'username', 'avatarUrl', 'isAdmin', 'isVip'] }]
          });
          
          if (char) {
            const profileData = await char.toSafeJSON();
            io.to(`user:${userId}`).emit('profile:update', profileData);
          }
        } catch (error) {
          console.error(`[Socket] Error handling profile request:`, error.message);
        }
      });

      // --- Gang Updates (HTTP replacement) ---
      socket.on('gang:request', async (data) => {
        try {
          const { gangId } = data;
          if (gangId) {
            await pushGangUpdate(gangId);
          } else {
            // Get user's gang
            const userGang = await Gang.findOne({
              include: [
                {
                  model: Character,
                  where: { userId },
                  required: false
                }
              ]
            });
            
            if (userGang) {
              io.to(`user:${userId}`).emit('gang:update', userGang);
            }
          }
        } catch (error) {
          console.error(`[Socket] Error handling gang request:`, error.message);
        }
      });

      // --- Moderation: Mute User ---
      socket.on('mute_user', async ({ targetUserId, durationMinutes }, callback) => {
        try {
          const admin = await User.findByPk(userId);
          if (!admin || !admin.isAdmin) return callback && callback({ error: 'Unauthorized' });
          const target = await User.findByPk(targetUserId);
          if (!target) return callback && callback({ error: 'User not found' });
          const until = new Date(Date.now() + (durationMinutes || 10) * 60000);
          target.chatMutedUntil = until;
          await target.save();
          io.to(`user:${targetUserId}`).emit('muted', { until });
          callback && callback({ success: true });
        } catch (err) {
          callback && callback({ error: err.message });
        }
      });

      // --- Moderation: Kick User ---
      socket.on('kick_user', async ({ targetUserId }, callback) => {
        try {
          const admin = await User.findByPk(userId);
          if (!admin || !admin.isAdmin) return callback && callback({ error: 'Unauthorized' });
          // Find all sockets for the user and disconnect them
          for (const [id, s] of io.of('/').sockets) {
            if (s.data.userId === targetUserId) {
              s.emit('kicked');
              s.disconnect();
            }
          }
          callback && callback({ success: true });
        } catch (err) {
          callback && callback({ error: err.message });
        }
      });

      // --- Moderation: Ban User ---
      socket.on('ban_user', async ({ targetUserId, durationMinutes }, callback) => {
        try {
          const admin = await User.findByPk(userId);
          if (!admin || !admin.isAdmin) return callback && callback({ error: 'Unauthorized' });
          const target = await User.findByPk(targetUserId);
          if (!target) return callback && callback({ error: 'User not found' });
          const until = new Date(Date.now() + (durationMinutes || 60) * 60000);
          target.chatBannedUntil = until;
          await target.save();
          io.to(`user:${targetUserId}`).emit('banned', { until });
          // Optionally disconnect user
          for (const [id, s] of io.of('/').sockets) {
            if (s.data.userId === targetUserId) {
              s.disconnect();
            }
          }
          callback && callback({ success: true });
        } catch (err) {
          callback && callback({ error: err.message });
        }
      });

      // --- Moderation: Delete Global Message ---
      socket.on('delete_global_message', async ({ messageId }, callback) => {
        try {
          const admin = await User.findByPk(userId);
          if (!admin || !admin.isAdmin) return callback && callback({ error: 'Unauthorized' });
          const message = await GlobalMessage.findByPk(messageId);
          if (!message) return callback && callback({ error: 'Message not found' });
          await message.destroy();
          io.to('global_chat').emit('global_message_deleted', { messageId });
          callback && callback({ success: true });
        } catch (err) {
          callback && callback({ error: err.message });
        }
      });

      // --- Moderation: Clear All Global Chat Messages ---
      socket.on('clear_global_chat', async (_data, callback) => {
        try {
          const admin = await User.findByPk(userId);
          if (!admin || !admin.isAdmin) return callback && callback({ error: 'Unauthorized' });
          await GlobalMessage.destroy({ where: {} });
          io.to('global_chat').emit('global_chat_cleared');
          callback && callback({ success: true });
        } catch (err) {
          callback && callback({ error: err.message });
        }
      });

      // --- Emoji Reactions for Global Chat ---
      socket.on('add_reaction', async ({ messageId, emoji }) => {
        try {
          const userId = socket.data.userId;
          const message = await GlobalMessage.findByPk(messageId);
          if (!message) return;
          let reactions = message.reactions || {};
          if (!reactions[emoji]) reactions[emoji] = [];
          if (!reactions[emoji].includes(userId)) {
            reactions[emoji].push(userId);
            message.reactions = reactions;
            await message.save();
            // Broadcast updated message
            const user = await User.findByPk(message.userId);
            const messageData = {
              id: message.id,
              userId: message.userId,
              username: message.username,
              avatarUrl: user?.avatarUrl,
              isAdmin: user?.isAdmin || false,
              isVip: user?.isVip || false,
              content: message.content,
              messageType: message.messageType,
              createdAt: message.createdAt,
              reactions: message.reactions
            };
            io.to('global_chat').emit('global_message', messageData);
          }
        } catch (error) {
          console.error('[Socket] Error adding reaction:', error);
        }
      });

      socket.on('remove_reaction', async ({ messageId, emoji }) => {
        try {
          const userId = socket.data.userId;
          const message = await GlobalMessage.findByPk(messageId);
          if (!message) return;
          let reactions = message.reactions || {};
          if (reactions[emoji]) {
            reactions[emoji] = reactions[emoji].filter(id => id !== userId);
            if (reactions[emoji].length === 0) delete reactions[emoji];
            message.reactions = reactions;
            await message.save();
            // Broadcast updated message
            const user = await User.findByPk(message.userId);
            const messageData = {
              id: message.id,
              userId: message.userId,
              username: message.username,
              avatarUrl: user?.avatarUrl,
              isAdmin: user?.isAdmin || false,
              isVip: user?.isVip || false,
              content: message.content,
              messageType: message.messageType,
              createdAt: message.createdAt,
              reactions: message.reactions
            };
            io.to('global_chat').emit('global_message', messageData);
          }
        } catch (error) {
          console.error('[Socket] Error removing reaction:', error);
        }
      });

      // --- Edit Global Message ---
      socket.on('edit_global_message', async ({ messageId, newContent }, callback) => {
        try {
          const userId = socket.data.userId;
          const message = await GlobalMessage.findByPk(messageId);
          if (!message) return callback && callback({ error: 'Message not found' });
          if (message.userId !== userId) return callback && callback({ error: 'Unauthorized' });
          if (!newContent || newContent.trim().length === 0) return callback && callback({ error: 'Message cannot be empty' });
          if (newContent.length > 500) return callback && callback({ error: 'Message too long (max 500 characters)' });
          message.content = newContent.trim();
          message.edited = true;
          message.editedAt = new Date();
          await message.save();
          const user = await User.findByPk(message.userId);
          const messageData = {
            id: message.id,
            userId: message.userId,
            username: message.username,
            avatarUrl: user?.avatarUrl,
            isAdmin: user?.isAdmin || false,
            isVip: user?.isVip || false,
            content: message.content,
            messageType: message.messageType,
            createdAt: message.createdAt,
            reactions: message.reactions,
            edited: message.edited,
            editedAt: message.editedAt
          };
          io.to('global_chat').emit('global_message', messageData);
          callback && callback({ success: true });
        } catch (error) {
          console.error('[Socket] Error editing global message:', error);
          callback && callback({ error: 'Failed to edit message' });
        }
      });

      // --- Disconnect handling ---
      socket.on('disconnect', () => {
        onlineGlobalChatUsers.delete(userId);
        io.to('global_chat').emit('global_chat_users_count', onlineGlobalChatUsers.size);
        clearInterval(tick);
      });
      
      socket.on('error', (error) => {
        console.error(`[Socket] Error for user ${userId}:`, error);
      });
      
    } catch (error) {
      console.error(`[Socket] Authentication error:`, error.message);
      socket.disconnect();
    }
  });

  // Add global error handlers
  io.engine.on('connection_error', (err) => {
    console.error('[Socket] Connection error:', err);
  });

  return io;
}

// Export helper functions for other services to use
export const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

export const emitToAll = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

export const emitToRoom = (room, event, data) => {
  if (io) {
    io.to(room).emit(event, data);
  }
};

// Enhanced notification system
export const emitNotification = (userId, notification) => {
  if (io) {
    io.to(`user:${userId}`).emit('notification', notification);
  }
};

export const createAndEmitNotification = async (userId, type, title, content, data = {}) => {
  try {
    const { NotificationService } = await import('./services/NotificationService.js');
    const notification = await NotificationService.createNotification(userId, type, title, content, data);
    emitNotification(userId, notification);
    return notification;
  } catch (error) {
    console.error('[Socket] Error creating and emitting notification:', error);
  }
};

// Export io instance for other services
export { io };
