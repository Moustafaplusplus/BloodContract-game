// -----------------------------------------------------------------------------
//  backend/src/socket.js  –  unified Socket.IO bootstrap (await fixes)
// -----------------------------------------------------------------------------
import { Server } from 'socket.io';
import jwt        from 'jsonwebtoken';
import { Character } from './features/character.js';

let io = null;

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
      socket.data.userId = userId;
      socket.join(String(userId));
      console.log('🔌 WS connected:', userId);

      /* helper to push one HUD snapshot */
      const pushHud = async () => {
        const char = await Character.findOne({ where: { userId } });
        if (char) socket.emit('hud:update', await char.toSafeJSON()); // ← await!
      };

      /* initial snapshot + 5-second heartbeat */
      pushHud();
      const tick = setInterval(pushHud, 5000);

      /* manual refresh from client */
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
