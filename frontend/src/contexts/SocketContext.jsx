import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';

const SocketContext = createContext(null);

function createSocket({ token }) {
  const API_URL =
    import.meta.env.VITE_API_URL ||
    'https://bloodcontract-game-production.up.railway.app';
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
  
  // Real-time game state
  const [hudData, setHudData] = useState(null);
  const [crimeData, setCrimeData] = useState(null);
  const [fightData, setFightData] = useState(null);
  const [bloodContracts, setBloodContracts] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [ministryMissions, setMinistryMissions] = useState([]);
  const [cars, setCars] = useState([]);
  const [dogs, setDogs] = useState([]);
  const [houses, setHouses] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [bank, setBank] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [gang, setGang] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [blackMarket, setBlackMarket] = useState([]);
  const [shop, setShop] = useState([]);
  const [specialShop, setSpecialShop] = useState([]);
  const [loginGifts, setLoginGifts] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [friendshipData, setFriendshipData] = useState({});

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
      console.log('[Socket] Connected successfully');
      setConnectionAttempts(0); // Reset connection attempts on successful connection
    });
    
    s.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
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
      console.error('[Socket] Connection error:', error);
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
      console.error('[Socket] Reconnection failed');
    });
    
    // HUD Updates
    s.on('hud:update', (data) => {
      setHudData(data);
    });
    
    // Crime Updates
    s.on('crime:update', (data) => {
      setCrimeData(data);
    });
    
    // Fight Updates
    s.on('fight:update', (data) => {
      setFightData(data);
    });
    
    // Blood Contract Updates
    s.on('bloodContract:update', (data) => {
      setBloodContracts(data);
    });
    
    // Job Updates
    s.on('jobs:update', (data) => {
      setJobs(data);
    });
    
    // Ministry Mission Updates
    s.on('ministryMission:update', (data) => {
      setMinistryMissions(data);
    });
    
    // Car Updates
    s.on('cars:update', (data) => {
      setCars(data);
    });
    
    // Dog Updates
    s.on('dogs:update', (data) => {
      setDogs(data);
    });
    
    // House Updates
    s.on('houses:update', (data) => {
      setHouses(data);
    });
    
    // Inventory Updates
    s.on('inventory:update', (data) => {
      setInventory(data);
    });
    
    // Bank Updates
    s.on('bank:update', (data) => {
      setBank(data);
    });
    
    // Task Updates
    s.on('tasks:update', (data) => {
      setTasks(data);
    });
    
    // Gang Updates
    s.on('gang:update', (data) => {
      setGang(data);
    });
    
    // Rankings Updates
    s.on('rankings:update', (data) => {
      setRankings(data);
    });
    
    // Black Market Updates
    s.on('blackMarket:update', (data) => {
      setBlackMarket(data);
    });
    
    // Shop Updates
    s.on('shop:update', (data) => {
      setShop(data);
    });
    
    // Special Shop Updates
    s.on('specialShop:update', (data) => {
      setSpecialShop(data);
    });
    
    // Login Gift Updates
    s.on('loginGift:update', (data) => {
      setLoginGifts(data);
    });
    
    // Profile Updates
    s.on('profile:update', (data) => {
      setProfileData(data);
    });
    
    // Friendship Updates
    s.on('friendship:update', (data) => {
      setFriendshipData(prev => ({
        ...prev,
        [data.targetUserId]: data
      }));
    });
    
    // Cooldown Updates
    s.on('cooldown:update', (data) => {
      setCooldowns(data);
    });
    
    // Confinement Events
    s.on('jail:enter', (data) => {
      console.log('[Socket] Entered jail:', data);
    });
    
    s.on('jail:leave', (data) => {
      console.log('[Socket] Left jail:', data);
    });
    
    s.on('hospital:enter', (data) => {
      console.log('[Socket] Entered hospital:', data);
    });
    
    s.on('hospital:leave', (data) => {
      console.log('[Socket] Left hospital:', data);
    });
    
    // Fight Results
    s.on('fightResult', (data) => {
      console.log('[Socket] Fight result received:', data);
    });
    
    // Notifications
    s.on('notification', (data) => {
      console.log('[Socket] Notification received:', data);
    });
    
    // Global Chat Events
    s.on('global_message', (data) => {
      console.log('[Socket] Global message received:', data);
    });
    
    s.on('global_chat_users_count', (count) => {
      console.log('[Socket] Global chat users count:', count);
    });
    
    // Moderation Events
    s.on('muted', (data) => {
      console.log('[Socket] User muted:', data);
    });
    
    s.on('banned', (data) => {
      console.log('[Socket] User banned:', data);
    });
    
    s.on('kicked', () => {
      console.log('[Socket] User kicked');
    });
    
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
    <SocketContext.Provider value={{ 
      socket, 
      cooldowns,
      // Real-time game state
      hudData,
      crimeData,
      fightData,
      bloodContracts,
      jobs,
      ministryMissions,
      cars,
      dogs,
      houses,
      inventory,
      bank,
      tasks,
      gang,
      rankings,
      blackMarket,
      shop,
      specialShop,
      loginGifts,
      profileData,
      friendshipData,
      // Helper functions to request updates
      requestHudUpdate: () => socket?.emit('hud:request'),
      requestCrimeUpdate: () => socket?.emit('crime:request'),
      requestFightUpdate: () => socket?.emit('fight:request'),
      requestBloodContractUpdate: () => socket?.emit('bloodContract:request'),
      requestJobsUpdate: () => socket?.emit('jobs:request'),
      requestMinistryMissionUpdate: () => socket?.emit('ministryMission:request'),
      requestCarsUpdate: () => socket?.emit('cars:request'),
      requestDogsUpdate: () => socket?.emit('dogs:request'),
      requestHousesUpdate: () => socket?.emit('houses:request'),
      requestInventoryUpdate: () => socket?.emit('inventory:request'),
      requestBankUpdate: () => socket?.emit('bank:request'),
      requestTasksUpdate: () => socket?.emit('tasks:request'),
      requestGangUpdate: (gangId) => socket?.emit('gang:request', { gangId }),
      requestRankingsUpdate: () => socket?.emit('rankings:request'),
      requestBlackMarketUpdate: () => socket?.emit('blackMarket:request'),
      requestShopUpdate: () => socket?.emit('shop:request'),
      requestSpecialShopUpdate: () => socket?.emit('specialShop:request'),
      requestLoginGiftUpdate: () => socket?.emit('loginGift:request'),
      requestProfileUpdate: (targetUserId) => socket?.emit('profile:request', { targetUserId }),
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within <SocketProvider>");
  return ctx;
} 