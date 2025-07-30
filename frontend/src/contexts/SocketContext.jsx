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
      return storedToken;
    };

    // Set initial token
    setToken(getToken());

    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'jwt') {
        setToken(e.newValue);
      }
    };

    // Listen for custom auth events
    const handleAuthChange = () => {
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
        localStorage.removeItem('jwt');
        setToken(null);
        setUserId(null);
        return;
      }
      setUserId(id);
    } catch (error) {
      setUserId(null);
    }
  }, [token]);

  useEffect(() => {
    // Clean up existing socket if no auth or user changed
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setConnectionAttempts(0);
    }

    if (!userId || !token) {
      return;
    }
    
    const s = createSocket({ token });
    
    s.on('connect', () => {
      
      setConnectionAttempts(0); // Reset connection attempts on successful connection
    });
    
    s.on('disconnect', (reason) => {
      
      if (reason === 'io server disconnect') {
        // Server disconnected us, try to reconnect
        setTimeout(() => {
          if (s && !s.connected) {
            s.connect();
          }
        }, 1000);
      }
    });
    
    s.on('connect_error', (error) => {
      
      setConnectionAttempts(prev => prev + 1);
      
      // If we've tried too many times, stop trying
      if (connectionAttempts >= 5) {
        return;
      }
      
      // Retry connection after a delay
      setTimeout(() => {
        if (s && !s.connected) {
          s.connect();
        }
      }, 2000);
    });
    
    s.on('error', (error) => {
      // Handle socket errors silently
    });
    
    s.on('reconnect', () => {
      setConnectionAttempts(0);
    });
    
    s.on('reconnect_error', (error) => {
      // Handle reconnection errors silently
    });
    
    s.on('reconnect_attempt', (attemptNumber) => {
      // Handle reconnection attempts silently
    });
    
    s.on('reconnect_failed', () => {
      // Handle reconnection failures silently
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
        s.connect();
      }
    }, 100);
    
    return () => {
      if (s) {
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