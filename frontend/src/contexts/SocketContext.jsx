import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';


const SocketContext = createContext(null);

function createSocket({ firebaseToken }) {
  const API_URL =
    import.meta.env.VITE_API_URL ||
    'https://bloodcontract-game-production.up.railway.app';
  return io(API_URL, {
    path: '/ws',
    auth: { token: firebaseToken },
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
  const [firebaseToken, setFirebaseToken] = useState(null);
  const [userId, setUserId] = useState(null);
  
  // Get Firebase token and user from FirebaseAuthProvider
  const { customToken, user } = useFirebaseAuth();
  
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
  
  // Additional state for HTTP-replacement data
  const [gameNews, setGameNews] = useState([]);
  const [confinementStatus, setConfinementStatus] = useState({ hospital: { inHospital: false }, jail: { inJail: false } });
  const [crimesList, setCrimesList] = useState([]);
  const [friendshipList, setFriendshipList] = useState([]);
  const [pendingFriendships, setPendingFriendships] = useState([]);
  const [messages, setMessages] = useState([]);
  const [globalChatMessages, setGlobalChatMessages] = useState([]);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [unclaimedTasksCount, setUnclaimedTasksCount] = useState(0);
  const [friendRequestsCount, setFriendRequestsCount] = useState(0);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [introStatus, setIntroStatus] = useState(null);

  // Update Firebase token and user ID when they change
  useEffect(() => {
    if (customToken && user) {
      setFirebaseToken(customToken);
      setUserId(user.uid);
    } else {
      setFirebaseToken(null);
      setUserId(null);
    }
  }, [customToken, user]);

  // Socket connection management
  useEffect(() => {
    if (!firebaseToken || !userId) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const newSocket = createSocket({ firebaseToken });
    
    newSocket.on('connect', () => {
      
      setConnectionAttempts(0);
      
      // Request initial data via Socket.IO instead of HTTP
      newSocket.emit('hud:request');
      newSocket.emit('inventory:request');
      newSocket.emit('bank:request');
      newSocket.emit('tasks:request');
      newSocket.emit('jobs:request');
      newSocket.emit('ministryMission:request');
      newSocket.emit('cars:request');
      newSocket.emit('dogs:request');
      newSocket.emit('houses:request');
      newSocket.emit('bloodContract:request');
      newSocket.emit('crime:request');
      newSocket.emit('fight:request');
      newSocket.emit('rankings:request');
      newSocket.emit('blackMarket:request');
      newSocket.emit('shop:request');
      newSocket.emit('specialShop:request');
      newSocket.emit('loginGift:request');
    });

    newSocket.on('disconnect', (reason) => {
      
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        newSocket.connect();
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error);
      setConnectionAttempts(prev => prev + 1);
    });

    // Socket event listeners for real-time updates
    newSocket.on('hud:update', (data) => {
      setHudData(data);
    });

    newSocket.on('inventory:update', (data) => {
      setInventory(data);
    });

    newSocket.on('bank:update', (data) => {
      setBank(data);
    });

    newSocket.on('tasks:update', (data) => {
      setTasks(data);
    });

    newSocket.on('jobs:update', (data) => {
      setJobs(data);
    });

    newSocket.on('ministryMission:update', (data) => {
      setMinistryMissions(data);
    });

    newSocket.on('cars:update', (data) => {
      setCars(data);
    });

    newSocket.on('dogs:update', (data) => {
      setDogs(data);
    });

    newSocket.on('houses:update', (data) => {
      setHouses(data);
    });

    newSocket.on('bloodContract:update', (data) => {
      
      setBloodContracts(data);
    });

    newSocket.on('crime:update', (data) => {
      setCrimeData(data);
    });

    newSocket.on('fight:update', (data) => {
      setFightData(data);
    });

    newSocket.on('rankings:update', (data) => {
      setRankings(data);
    });

    newSocket.on('blackMarket:update', (data) => {
      setBlackMarket(data);
    });

    newSocket.on('shop:update', (data) => {
      setShop(data);
    });

    newSocket.on('specialShop:update', (data) => {
      setSpecialShop(data);
    });

    newSocket.on('loginGift:update', (data) => {
      setLoginGifts(data);
    });

    newSocket.on('profile:update', (data) => {
      setProfileData(data);
    });

    newSocket.on('friendship:update', (data) => {
      setFriendshipData(prev => ({
        ...prev,
        [data.targetUserId]: data
      }));
    });

    // Additional event listeners for HTTP-replacement data
    newSocket.on('gameNews:update', (data) => {
      setGameNews(data);
    });

    newSocket.on('confinement:update', (data) => {
      setConfinementStatus(data);
    });

    newSocket.on('crimes:update', (data) => {
      setCrimesList(data);
    });

    newSocket.on('friendshipList:update', (data) => {
      setFriendshipList(data);
    });

    newSocket.on('pendingFriendships:update', (data) => {
      setPendingFriendships(data);
    });

    newSocket.on('messages:update', (data) => {
      setMessages(data);
    });

    newSocket.on('globalChatMessages:update', (data) => {
      setGlobalChatMessages(data);
    });

    newSocket.on('unreadMessagesCount:update', (data) => {
      setUnreadMessagesCount(data);
    });

    newSocket.on('unclaimedTasksCount:update', (data) => {
      setUnclaimedTasksCount(data);
    });

    newSocket.on('friendRequestsCount:update', (data) => {
      setFriendRequestsCount(data);
    });

    newSocket.on('notificationsCount:update', (data) => {
      setNotificationsCount(data);
    });

    newSocket.on('introStatus:update', (data) => {
      setIntroStatus(data);
    });

    setSocket(newSocket);
    
    // Manually connect the socket
    newSocket.connect();

    return () => {
      newSocket.disconnect();
    };
  }, [firebaseToken, userId]);

  // Socket methods for making requests (replacing HTTP calls)
  const socketRequest = (event, data = {}) => {
    return new Promise((resolve, reject) => {
      if (!socket || !socket.connected) {
        reject(new Error('Socket not connected'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Socket request timeout'));
      }, 10000);

      socket.emit(event, data, (response) => {
        clearTimeout(timeout);
        if (response && response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  };

  const contextValue = {
    socket,
    userId,
    connectionAttempts,
    isConnected: socket?.connected || false,
    
    // Real-time data
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
    
    // HTTP-replacement data
    gameNews,
    confinementStatus,
    crimesList,
    friendshipList,
    pendingFriendships,
    messages,
    globalChatMessages,
    unreadMessagesCount,
    unclaimedTasksCount,
    friendRequestsCount,
    notificationsCount,
    introStatus,
    
    // Methods
    socketRequest,
    
    // Request methods (replacing HTTP calls)
    requestHud: () => socket?.emit('hud:request'),
    requestInventory: () => socket?.emit('inventory:request'),
    requestBank: () => socket?.emit('bank:request'),
    requestTasks: () => socket?.emit('tasks:request'),
    requestJobs: () => socket?.emit('jobs:request'),
    requestMinistryMissions: () => socket?.emit('ministryMission:request'),
    requestCars: () => socket?.emit('cars:request'),
    requestDogs: () => socket?.emit('dogs:request'),
    requestHouses: () => socket?.emit('houses:request'),
    requestBloodContracts: () => socket?.emit('bloodContract:request'),
    requestCrime: () => socket?.emit('crime:request'),
    requestFight: () => socket?.emit('fight:request'),
    requestRankings: () => socket?.emit('rankings:request'),
    requestBlackMarket: () => socket?.emit('blackMarket:request'),
    requestShop: () => socket?.emit('shop:request'),
    requestSpecialShop: () => socket?.emit('specialShop:request'),
    requestLoginGifts: () => socket?.emit('loginGift:request'),
    requestProfile: (targetUserId) => socket?.emit('profile:request', { targetUserId }),
    requestGang: (gangId) => socket?.emit('gang:request', { gangId }),
    
    // Additional request methods for HTTP-replacement
    requestGameNews: () => socket?.emit('gameNews:request'),
    requestConfinement: () => socket?.emit('confinement:request'),
    requestCrimes: () => socket?.emit('crimes:request'),
    requestFriendshipList: () => socket?.emit('friendshipList:request'),
    requestPendingFriendships: () => socket?.emit('pendingFriendships:request'),
    requestMessages: (targetUserId) => socket?.emit('messages:request', { targetUserId }),
    requestGlobalChatMessages: () => socket?.emit('globalChatMessages:request'),
    requestUnreadMessagesCount: () => socket?.emit('unreadMessagesCount:request'),
    requestUnclaimedTasksCount: () => socket?.emit('unclaimedTasksCount:request'),
    requestFriendRequestsCount: () => socket?.emit('friendRequestsCount:request'),
    requestNotificationsCount: () => socket?.emit('notificationsCount:request'),
    requestIntroStatus: () => socket?.emit('introStatus:request'),
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}; 