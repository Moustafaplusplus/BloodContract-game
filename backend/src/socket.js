// -----------------------------------------------------------------------------
//  backend/src/socket.js  –  unified Socket.IO bootstrap (await fixes)
// -----------------------------------------------------------------------------
import { Server } from 'socket.io';
import jwt        from 'jsonwebtoken';
import { Character } from './models/Character.js';

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
          console.log('📊 Sending HUD data to user', userId, ':', {
            hp: hudData.hp,
            maxHp: hudData.maxHp,
            energy: hudData.energy,
            maxEnergy: hudData.maxEnergy,
            exp: hudData.exp,
            nextLevelExp: hudData.nextLevelExp,
            money: hudData.money
          });
          socket.emit('hud:update', hudData);
        } else {
          console.log('❌ No character found for user:', userId);
        }
      };

      /* initial snapshot + 5-second heartbeat */
      pushHud();
      const tick = setInterval(pushHud, 5000);

      /* manual refresh from client */
      socket.on('hud:request', () => {
        console.log('🔄 Manual HUD refresh requested by user:', userId);
        pushHud();
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
