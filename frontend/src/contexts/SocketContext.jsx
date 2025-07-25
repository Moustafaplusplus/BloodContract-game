import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';

const SocketContext = createContext(null);

function createSocket({ token }) {
  const API_URL =
    import.meta.env.VITE_API_URL ||
    'http://localhost:5001';
  return io(API_URL, {
    path: '/ws',
    auth: { token },
    transports: ['websocket', 'polling'],
    forceNew: true, // Force new connection for each user
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    autoConnect: false, // Don't auto-connect, we'll connect manually
    upgrade: true,
    rememberUpgrade: true,
  });
}

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [cooldowns, setCooldowns] = useState({});
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);

  // Get token from localStorage and track changes
  useEffect(() => {
    const getToken = () => {
      const storedToken = localStorage.getItem('jwt');
      console.log('[Socket] Token from localStorage:', storedToken ? 'Present' : 'Not found');
      return storedToken;
    };

    // Set initial token
    setToken(getToken());

    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'jwt') {
        console.log('[Socket] JWT changed in localStorage');
        setToken(e.newValue);
      }
    };

    // Listen for custom auth events
    const handleAuthChange = () => {
      console.log('[Socket] Auth change event received');
      setToken(getToken());
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-change', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  // Extract userId from token
  useEffect(() => {
    if (!token) {
      setUserId(null);
      return;
    }

    try {
      const { id, exp } = jwtDecode(token);
      const now = Math.floor(Date.now() / 1000);
      if (exp < now) {
        console.log('[Socket] Token expired, removing from localStorage');
        localStorage.removeItem('jwt');
        setToken(null);
        setUserId(null);
        return;
      }
      console.log('[Socket] Decoded userId:', id);
      setUserId(id);
    } catch (error) {
      console.error('[Socket] Error decoding token:', error);
      setUserId(null);
    }
  }, [token]);

  useEffect(() => {
    console.log('[Socket] useEffect triggered - userId:', userId, 'token:', token ? 'Present' : 'Not found');
    
    // Clean up existing socket if no auth or user changed
    if (socket) {
      console.log('[Socket] Disconnecting existing socket due to auth change');
      socket.disconnect();
      setSocket(null);
      setConnectionAttempts(0);
    }

    if (!userId || !token) {
      console.log('[Socket] No valid auth, not connecting');
      return;
    }
    
    console.log('[Socket] Creating new socket connection for user:', userId);
    const s = createSocket({ token });
    
    s.on('connect', () => {
      console.log('[Socket] Connected successfully');
      console.log('[Socket] Socket ID:', s.id);
      console.log('[Socket] User ID:', userId);
      setConnectionAttempts(0); // Reset connection attempts on successful connection
    });
    
    s.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Server disconnected us, try to reconnect
        setTimeout(() => {
          if (s && !s.connected) {
            console.log('[Socket] Attempting to reconnect after server disconnect');
            s.connect();
          }
        }, 1000);
      }
    });
    
    s.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error);
      setConnectionAttempts(prev => prev + 1);
      
      // If we've tried too many times, stop trying
      if (connectionAttempts >= 5) {
        console.error('[Socket] Too many connection attempts, stopping');
        return;
      }
      
      // Retry connection after a delay
      setTimeout(() => {
        if (s && !s.connected) {
          console.log('[Socket] Retrying connection attempt:', connectionAttempts + 1);
          s.connect();
        }
      }, 2000);
    });
    
    s.on('error', (error) => {
      console.error('[Socket] Socket error:', error);
    });
    
    s.on('reconnect', () => {
      console.log('[Socket] Reconnected');
      setConnectionAttempts(0);
    });
    
    s.on('reconnect_error', (error) => {
      console.error('[Socket] Reconnection error:', error);
    });
    
    s.on('reconnect_attempt', (attemptNumber) => {
      console.log('[Socket] Reconnection attempt:', attemptNumber);
    });
    
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
    
    // Connect manually after setting up event handlers
    setTimeout(() => {
      if (s && !s.connected) {
        console.log('[Socket] Manually connecting socket');
        s.connect();
      }
    }, 100);
    
    return () => {
      if (s) {
        console.log('[Socket] Cleaning up socket connection');
        s.disconnect();
      }
    };
  }, [userId, token, connectionAttempts]);

  return (
    <SocketContext.Provider value={{ socket, cooldowns }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within <SocketProvider>");
  return ctx;
} 