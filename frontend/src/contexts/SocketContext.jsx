import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';

const SocketContext = createContext(null);

function createSocket({ token }) {
  const API_URL =
    import.meta.env.VITE_API_URL ||
    'http://localhost:5000';
  return io(API_URL, {
    path: '/ws',
    auth: { token },
    transports: ['websocket', 'polling'],
    forceNew: false,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    autoConnect: true,
    upgrade: true,
    rememberUpgrade: true,
  });
}

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [cooldowns, setCooldowns] = useState({});

  // Auth
  const token = useMemo(() => {
    const storedToken = localStorage.getItem('jwt');
    return storedToken;
  }, []);
  const userId = useMemo(() => {
    if (!token) return null;
    try {
      const { id, exp } = jwtDecode(token);
      const now = Math.floor(Date.now() / 1000);
      if (exp < now) {
        localStorage.removeItem('jwt');
        return null;
      }
      return id;
    } catch {
      return null;
    }
  }, [token]);

  useEffect(() => {
    if (!userId || !token) return;
    if (socket && socket.connected) return;
    const s = createSocket({ token });
    s.on('connect', () => {});
    s.on('disconnect', (reason) => {
      if (reason === 'io server disconnect') {
        s.connect();
      }
    });
    s.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error);
    });
    s.on('error', (error) => {
      console.error('[Socket] Socket error:', error);
    });
    s.on('reconnect', () => {});
    s.on('reconnect_error', (error) => {
      console.error('[Socket] Reconnection error:', error);
    });
    s.on('reconnect_attempt', () => {});
    s.on('reconnect_failed', () => {
      console.error('[Socket] Reconnection failed after all attempts');
    });
    s.on('cooldown:update', (data) => {
      setCooldowns(data);
    });
    s.on('jail:enter', () => {});
    s.on('jail:leave', () => {});
    s.on('hospital:enter', () => {});
    s.on('hospital:leave', () => {});
    setSocket(s);
    return () => {
      s.disconnect();
    };
    // eslint-disable-next-line
  }, [userId, token]);

  return (
    <SocketContext.Provider value={{ socket, cooldowns }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
} 