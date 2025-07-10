/* ------------------ src/hooks/useSocket.js ------------------ */
import { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';

/**
 * Shared authenticated Socket.IO connection.
 *
 * Exposes:
 *   • socket     – raw Socket.IO instance
 *   • cooldowns  – { [crimeId]: secondsLeft }
 *
 * HUD data is handled separately by useHud() to avoid duplicate listeners.
 */
function createSocket({ userId, token }) {
  const API_URL =
    import.meta.env.VITE_API_URL ||
    process.env.REACT_APP_API_URL ||
    'http://localhost:5000';

  console.log('🔌 Creating socket connection to:', API_URL, 'with userId:', userId);
  
  return io(API_URL, {
    path: '/ws',
    auth: { token }, // Backend only expects token, not userId
    transports: ['websocket'],
  });
}

function useSocket(passedUserId) {
  const [socket, setSocket] = useState(null);
  const [cooldowns, setCooldowns] = useState({});

  /* -------------------- Auth -------------------- */
  const token = useMemo(() => localStorage.getItem('jwt'), []);
  const userId = useMemo(() => {
    if (passedUserId) return passedUserId;
    if (!token) return null;

    try {
      const { id } = jwtDecode(token);
      console.log('🔑 Decoded userId from token:', id);
      return id;
    } catch (error) {
      console.error('❌ Failed to decode token:', error);
      return null;
    }
  }, [passedUserId, token]);

  /* ------------------- Connect ------------------ */
  useEffect(() => {
    if (!userId || !token) {
      console.log('⚠️ Socket connection skipped - missing userId or token:', { userId: !!userId, token: !!token });
      return;
    }

    console.log('🔌 Attempting socket connection...');
    const s = createSocket({ userId, token });

    s.on('connect', () => {
      console.log('✅ Socket connected successfully:', s.id);
    });
    s.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
    });
    s.on('connect_error', (err) => {
      console.error('❌ Socket connection error:', err.message);
    });
    s.on('error', (err) => {
      console.error('❌ Socket error:', err);
    });

    /* ---------- Auxiliary server channels ---------- */
    s.on('cooldown:update', (data) => {
      console.log('⏰ Cooldown update received:', data);
      setCooldowns(data);
    });

    setSocket(s);
    return () => {
      console.log('🔌 Cleaning up socket connection');
      s.disconnect();
    };
  }, [userId, token]);

  return { socket, cooldowns };
}

/* Export as both default and named so callers can choose either style */
export { useSocket };
export default useSocket;

/* ------------------ END src/hooks/useSocket.js ------------------ */