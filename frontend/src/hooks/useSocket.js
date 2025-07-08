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

  return io(API_URL, {
    path: '/ws',
    auth: { userId, token },
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
      return id;
    } catch {
      return null;
    }
  }, [passedUserId, token]);

  /* ------------------- Connect ------------------ */
  useEffect(() => {
    if (!userId || !token) return;

    const s = createSocket({ userId, token });

    s.on('connect', () => console.debug('[socket] connected', s.id));
    s.on('disconnect', (reason) =>
      console.debug('[socket] disconnected:', reason)
    );
    s.on('connect_error', (err) =>
      console.error('[socket] connect_error:', err.message)
    );
    s.on('error', (err) => console.error('[socket] error:', err));

    /* ---------- Auxiliary server channels ---------- */
    s.on('cooldown:update', setCooldowns);

    setSocket(s);
    return () => s.disconnect();
  }, [userId, token]);

  return { socket, cooldowns };
}

/* Export as both default and named so callers can choose either style */
export { useSocket };
export default useSocket;

/* ------------------ END src/hooks/useSocket.js ------------------ */