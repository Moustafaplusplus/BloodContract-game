// -----------------------------------------------------------------------------
//  backend/src/socket.js  –  unified Socket.IO bootstrap (await fixes)
// -----------------------------------------------------------------------------
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { Character } from './models/Character.js';
import { Message } from './models/Message.js';
import { User } from './models/User.js';

let io = null;

export function initSocket(server) {
  io = new Server(server, {
    path: '/ws',
    cors: { origin: process.env.CLIENT_URL || '*', credentials: true },
    transports: ['websocket'],
  });

  io.on('connection', async (socket) => {
    const token = socket.handshake.auth?.token;
    console.log('🔌 Socket connection attempt - token present:', !!token);
    
    if (!token) {
      console.log('❌ Socket disconnected - no token provided');
      return socket.disconnect();
    }

    try {
      const { id: userId } = jwt.verify(token, process.env.JWT_SECRET);
      socket.data.userId = userId;
      socket.join(String(userId));
      console.log('🔌 WS connected:', userId);

      /* helper to push one HUD snapshot */
      const pushHud = async () => {
        const char = await Character.findOne({ where: { userId } });
        if (char) {
          const hudData = await char.toSafeJSON();
          socket.emit('hud:update', hudData);
        }
      };

      /* initial snapshot + 5-second heartbeat */
      pushHud();
      const tick = setInterval(pushHud, 5000);

      /* manual refresh from client */
      socket.on('hud:request', () => {
        pushHud();
      });

      // --- Messaging system ---
      socket.on('join', (userId) => {
        socket.join(`user_${userId}`);
      });

      socket.on('send_message', async (data) => {
        const { senderId, receiverId, content } = data;
        // Save message to DB
        const message = await Message.create({ senderId, receiverId, content });
        // Emit to receiver if online
        io.to(`user_${receiverId}`).emit('receive_message', message);
        // Optionally, emit to sender for confirmation
        socket.emit('message_sent', message);
      });

      socket.on('disconnect', () => {
        clearInterval(tick);
        console.log('🛑 WS disconnected:', userId);
      });
    } catch (err) {
      console.error('❌ Invalid WS token:', err.message);
      socket.disconnect();
    }
  });

  return io;
}

export { io };
