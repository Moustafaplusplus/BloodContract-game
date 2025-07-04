// src/ws.js
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from './models/user.js';
import Character from './models/character.js';

export function mountWebSocket(server) {
  const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    path: '/ws',
  });

  io.on('connection', async (socket) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      console.warn('❌ No token provided to WebSocket');
      socket.disconnect();
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;

      console.log(`🔌 WS connected: ${userId}`);

      const tick = async () => {
        const character = await Character.findOne({ where: { userId } });
        if (!character) return;

        socket.emit('hud:update', {
          energy: character.energy,
          health: character.hp,
          courage: character.courage,
          will: character.will,
        });
      };

      tick(); // initial send
      const id = setInterval(tick, 5000);

      socket.on('disconnect', () => {
        clearInterval(id);
        console.log(`🛑 WS disconnected: ${userId}`);
      });
    } catch (err) {
      console.error('❌ Invalid WS token', err.message);
      socket.disconnect();
    }
  });
}
