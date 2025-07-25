// -----------------------------------------------------------------------------
//  backend/src/socket.js  –  unified Socket.IO bootstrap (await fixes)
// -----------------------------------------------------------------------------
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { Character } from './models/Character.js';
import { Message } from './models/Message.js';
import { GlobalMessage } from './models/GlobalMessage.js';
import { User } from './models/User.js';

let io = null;

export function initSocket(server) {
  io = new Server(server, {
    path: '/ws',
    cors: { origin: process.env.CLIENT_URL || '*', credentials: true },
    transports: ['websocket', 'polling'], // Add polling as fallback
    pingTimeout: 60000, // Increase ping timeout
    pingInterval: 25000, // Increase ping interval
    upgradeTimeout: 10000, // Increase upgrade timeout
    allowUpgrades: true,
    maxHttpBufferSize: 1e6, // 1MB buffer size
  });

  io.on('connection', async (socket) => {
    console.log('[Socket] New connection attempt:', socket.id);
    // socket.onAny((event, ...args) => {
    //   console.log('[Socket] Received event:', event, args);
    // });
    const token = socket.handshake.auth?.token;
    console.log('[Socket] Handshake token:', token);
    
    if (!token) {
      console.log('[Socket] No token provided, disconnecting:', socket.id);
      return socket.disconnect();
    }

    try {
      const { id: userId } = jwt.verify(token, process.env.JWT_SECRET);
      console.log('[Socket] Authenticated userId:', userId);
      socket.data.userId = userId;
      socket.join(String(userId));
      console.log('[Socket] User joined room:', String(userId));
      
      // User connected successfully

      /* helper to push one HUD snapshot */
      const pushHud = async () => {
        try {
          const char = await Character.findOne({ 
            where: { userId },
            include: [{ model: User, attributes: ['id', 'username', 'avatarUrl', 'isAdmin', 'isVip'] }]
          });
          if (char) {
            const hudData = await char.toSafeJSON();
            
            // Get hospital and jail status
            const { ConfinementService } = await import('./services/ConfinementService.js');
            const hospitalStatus = await ConfinementService.getHospitalStatus(userId);
            const jailStatus = await ConfinementService.getJailStatus(userId);
            
            // Calculate cooldowns
            const now = Date.now();
            const crimeCooldown = char.crimeCooldown && char.crimeCooldown > now 
              ? Math.ceil((char.crimeCooldown - now) / 1000) 
              : 0;
            const gymCooldown = char.gymCooldown && char.gymCooldown > now 
              ? Math.ceil((char.gymCooldown - now) / 1000) 
              : 0;
            
            // Add status data to HUD
            const enhancedHudData = {
              ...hudData,
              hospitalStatus,
              jailStatus,
              crimeCooldown,
              gymCooldown
            };
            
            console.log(`[Socket] Sending HUD data for user ${userId}:`, {
              username: hudData.username || 'No username',
              level: hudData.level || 'No level',
              userId: hudData.userId || 'No userId',
              hospitalIn: hospitalStatus.inHospital,
              jailIn: jailStatus.inJail,
              crimeCD: crimeCooldown,
              gymCD: gymCooldown
            });
            socket.emit('hud:update', enhancedHudData);
          } else {
            console.log(`[Socket] No character found for user ${userId}`);
          }
        } catch (error) {
          console.error(`[Socket] Error pushing HUD for user ${userId}:`, error.message);
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
        console.log('[Socket] join_global_chat received from user:', userId);
        socket.join('global_chat');
        onlineGlobalChatUsers.add(userId);
        // Emit updated online count to all in global chat
        io.to('global_chat').emit('online_count', { count: onlineGlobalChatUsers.size });
        console.log(`[Global Chat] User ${userId} joined global chat (socket ${socket.id})`);
        // Send a test message to confirm connection
        socket.emit('global_message', {
          id: 'test',
          userId: 'system',
          username: 'System',
          avatarUrl: '/avatars/default.png',
          isAdmin: true,
          isVip: false,
          content: 'تم الاتصال بالدردشة العامة بنجاح!',
          messageType: 'SYSTEM',
          createdAt: new Date()
        });
      });

      socket.on('leave_global_chat', async () => {
        socket.leave('global_chat');
        onlineGlobalChatUsers.delete(userId);
        io.to('global_chat').emit('online_count', { count: onlineGlobalChatUsers.size });
        console.log(`[Global Chat] User ${userId} left global chat (socket ${socket.id})`);
      });

      // Respond to get_online_count event
      socket.on('get_online_count', () => {
        socket.emit('online_count', { count: onlineGlobalChatUsers.size });
      });

      socket.on('send_global_message', async (data) => {
        try {
          console.log('[Global Chat] Received message:', data);
          const { content } = data;
          
          // Get user info
          const user = await User.findByPk(userId);
          if (!user) {
            console.log('[Global Chat] User not found:', userId);
            socket.emit('global_message_error', { error: 'User not found' });
            return;
          }

          // Check chat ban
          if (user.chatBannedUntil && new Date(user.chatBannedUntil) > new Date()) {
            socket.emit('global_message_error', { error: 'تم حظرك من الدردشة العامة.' });
            return;
          }
          // Check chat mute
          if (user.chatMutedUntil && new Date(user.chatMutedUntil) > new Date()) {
            socket.emit('global_message_error', { error: 'تم كتمك في الدردشة العامة.' });
            return;
          }

          // Validate message
          if (!content || content.trim().length === 0) {
            socket.emit('global_message_error', { error: 'Message cannot be empty' });
            return;
          }

          if (content.length > 500) {
            socket.emit('global_message_error', { error: 'Message too long (max 500 characters)' });
            return;
          }

          console.log('[Global Chat] Creating message for user:', user.username);
          
          // Save to database
          const message = await GlobalMessage.create({
            userId: userId,
            username: user.username,
            content: content.trim(),
            messageType: 'GLOBAL'
          });

          console.log('[Global Chat] Message saved:', message.id);

          // Broadcast to all users in global chat
          const messageData = {
            id: message.id,
            userId: userId,
            username: user.username,
            avatarUrl: user.avatarUrl,
            isAdmin: user.isAdmin,
            isVip: user.isVip,
            content: message.content,
            messageType: message.messageType,
            createdAt: message.createdAt
          };

          console.log('[Global Chat] Broadcasting message:', messageData);
          io.to('global_chat').emit('global_message', messageData);
          console.log(`[Global Chat] Emitted global_message to global_chat room`);

          console.log(`[Global Chat] ${user.username}: ${content}`);
        } catch (error) {
          console.error(`[Socket] Error sending global message:`, error);
          socket.emit('global_message_error', { error: 'Failed to send message: ' + error.message });
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
          io.to(String(targetUserId)).emit('muted', { until });
          console.log(`[Global Chat] Emitted muted to user ${targetUserId}`);
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
              console.log(`[Global Chat] Emitted kicked to user ${targetUserId} (socket ${id})`);
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
          io.to(String(targetUserId)).emit('banned', { until });
          console.log(`[Global Chat] Emitted banned to user ${targetUserId}`);
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
          console.log(`[Global Chat] Emitted global_message_deleted for message ${messageId}`);
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
          console.log('[Global Chat] All messages cleared by admin:', userId);
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
              avatarUrl: user?.avatarUrl || '/avatars/default.png',
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
              avatarUrl: user?.avatarUrl || '/avatars/default.png',
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
            avatarUrl: user?.avatarUrl || '/avatars/default.png',
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
          console.log(`[Global Chat] Emitted global_message (edit) for message ${message.id}`);
          callback && callback({ success: true });
        } catch (error) {
          console.error('[Socket] Error editing global message:', error);
          callback && callback({ error: 'Failed to edit message' });
        }
      });

      socket.on('disconnect', async (reason) => {
        clearInterval(tick);
        // Remove from online global chat users if present
        if (onlineGlobalChatUsers.has(userId)) {
          onlineGlobalChatUsers.delete(userId);
          io.to('global_chat').emit('online_count', { count: onlineGlobalChatUsers.size });
        }
      });
      
      socket.on('error', (error) => {
        console.error(`[Socket] Error for user ${userId}:`, error);
      });
      
    } catch (err) {
      console.error('[Socket] Authentication error:', err.message);
      socket.disconnect();
    }
  });

  // Add global error handlers
  io.engine.on('connection_error', (err) => {
    console.error('[Socket] Connection error:', err);
  });

  return io;
}

// Function to emit notification to a specific user
export const emitNotification = (userId, notification) => {
  console.log('[Socket] Emitting notification to user:', userId, 'notification:', notification.id);
  if (io) {
    io.to(String(userId)).emit('notification', notification);
    console.log('[Socket] Notification emitted successfully');
  } else {
    console.error('[Socket] IO not initialized, cannot emit notification');
  }
};

// Function to create and emit notification
export const createAndEmitNotification = async (userId, type, title, content, data = {}) => {
  try {
    // This function is deprecated - use NotificationService.createNotification() and emitNotification() separately
    console.warn('createAndEmitNotification is deprecated. Use NotificationService.createNotification() and emitNotification() separately.');
    return null;
  } catch (error) {
    console.error('Error creating and emitting notification:', error);
    throw error;
  }
};

export { io };
