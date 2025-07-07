// ------------------------------------------------------------
//  backend/src/socket.js – unified Socket.IO bootstrap
// ------------------------------------------------------------
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { Character } from './features/character.js';

let io = null;

/**
 * Attach Socket-IO to an existing HTTP server.
 * Each client sends `{ token }` in `auth` during connection.
 *  – Joins a personal room named by userId so other modules can emit
 *  – Emits `hud:update` snapshot every 5 s or on manual request
 */
export function initSocket(server) {
  io = new Server(server, {
    path: '/ws',
    cors: { origin: process.env.CLIENT_URL || '*', credentials: true },
    transports: ['websocket'],
  });

  io.on('connection', async (socket) => {
    const token = socket.handshake.auth?.token;
    if (!token) return socket.disconnect();

    try {
      const { id: userId } = jwt.verify(token, process.env.JWT_SECRET);
      socket.data.userId = userId; // store for middleware use
      socket.join(String(userId)); // personal room for DM / notifications
      console.log('🔌 WS connected:', userId);

      /* ─ Helper: push HUD snapshot ─ */
      const pushHud = async () => {
        const character = await Character.findOne({ where: { userId } });
        if (character) socket.emit('hud:update', character.toSafeJSON());
      };
      pushHud();
      const tick = setInterval(pushHud, 5000);

      /* ─ Manual HUD refresh from client ─ */
      socket.on('hud:request', pushHud);

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
