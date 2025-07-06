// backend/src/socket.js
// ------------------------------------------------------------
// Centralised Socket-IO bootstrap + HUD ticker
// ------------------------------------------------------------
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Character from './models/character.js';

let io = null;

/**
 * Attach Socket-IO to an existing HTTP server.
 * @param {http.Server} server
 * @returns {import('socket.io').Server}
 */
export function initSocket(server) {
  io = new Server(server, {
    path: '/ws',
    cors: {
      origin: process.env.CLIENT_URL || '*',
      credentials: true,
    },
    transports: ['websocket'], // matches frontend's preference
  });

  io.on('connection', async (socket) => {
    const token = socket.handshake.auth?.token;
    if (!token) return socket.disconnect();

    try {
      const { id: userId } = jwt.verify(token, process.env.JWT_SECRET);
      console.log('🔌 WS connected:', userId);

      // Helper to push full HUD payload
      const pushHud = async () => {
        const character = await Character.findOne({ where: { userId } });
        if (character) socket.emit('hud:update', character.toSafeJSON());
      };

      pushHud();                         // initial snapshot
      const tickId = setInterval(pushHud, 5000); // periodic updates

      socket.on('disconnect', () => {
        clearInterval(tickId);
        console.log('🛑 WS disconnected:', userId);
      });
    } catch (err) {
      console.error('❌ Invalid WS token:', err.message);
      socket.disconnect();
    }
  });

  return io;
}

// Allow other modules to import { io } for emits
export { io };
