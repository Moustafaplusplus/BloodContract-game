import { useSocket } from '@/hooks/useSocket';
import { useEffect } from 'react';

// Hook to get character data via Socket.IO
export const useCharacterData = () => {
  const { hudData, isConnected, requestHud } = useSocket();
  
  useEffect(() => {
    if (isConnected) {
      requestHud();
    }
  }, [isConnected, requestHud]);
  
  return {
    character: hudData,
    isLoading: !isConnected || !hudData,
    error: !isConnected ? new Error('Socket not connected') : null
  };
};

// Hook to get game news via Socket.IO
export const useGameNews = () => {
  const { gameNews, isConnected, requestGameNews } = useSocket();
  
  useEffect(() => {
    if (isConnected) {
      requestGameNews();
    }
  }, [isConnected, requestGameNews]);
  
  return {
    gameNews,
    isLoading: !isConnected || !gameNews,
    error: !isConnected ? new Error('Socket not connected') : null
  };
};

// Hook to get confinement status via Socket.IO
export const useConfinementData = () => {
  const { confinementStatus, isConnected, requestConfinement } = useSocket();
  
  useEffect(() => {
    if (isConnected) {
      requestConfinement();
    }
  }, [isConnected, requestConfinement]);
  
  return {
    confinementStatus,
    isLoading: !isConnected || !confinementStatus,
    error: !isConnected ? new Error('Socket not connected') : null
  };
};

// Hook to get crimes list via Socket.IO
export const useCrimesData = () => {
  const { crimesList, isConnected, requestCrimes } = useSocket();
  
  useEffect(() => {
    if (isConnected) {
      requestCrimes();
    }
  }, [isConnected, requestCrimes]);
  
  return {
    crimes: crimesList,
    isLoading: !isConnected || !crimesList,
    error: !isConnected ? new Error('Socket not connected') : null
  };
};

// Hook to get friendship data via Socket.IO
export const useFriendshipData = () => {
  const { friendshipList, pendingFriendships, isConnected, requestFriendshipList, requestPendingFriendships } = useSocket();
  
  useEffect(() => {
    if (isConnected) {
      requestFriendshipList();
      requestPendingFriendships();
    }
  }, [isConnected, requestFriendshipList, requestPendingFriendships]);
  
  return {
    friendships: friendshipList,
    pendingFriendships,
    isLoading: !isConnected || (!friendshipList && !pendingFriendships),
    error: !isConnected ? new Error('Socket not connected') : null
  };
};

// Hook to get messages data via Socket.IO
export const useMessagesData = (targetUserId) => {
  const { messages, isConnected, requestMessages } = useSocket();
  
  useEffect(() => {
    if (isConnected && targetUserId) {
      requestMessages(targetUserId);
    }
  }, [isConnected, targetUserId, requestMessages]);
  
  return {
    messages,
    isLoading: !isConnected || !messages,
    error: !isConnected ? new Error('Socket not connected') : null
  };
};

// Hook to get global chat messages via Socket.IO
export const useGlobalChatData = () => {
  const { globalChatMessages, isConnected, requestGlobalChatMessages } = useSocket();
  
  useEffect(() => {
    if (isConnected) {
      requestGlobalChatMessages();
    }
  }, [isConnected, requestGlobalChatMessages]);
  
  return {
    messages: globalChatMessages,
    isLoading: !isConnected || !globalChatMessages,
    error: !isConnected ? new Error('Socket not connected') : null
  };
};

// Hook to get counts data via Socket.IO
export const useCountsData = () => {
  const { 
    unreadMessagesCount, 
    unclaimedTasksCount, 
    friendRequestsCount, 
    notificationsCount,
    isConnected,
    requestUnreadMessagesCount,
    requestUnclaimedTasksCount,
    requestFriendRequestsCount,
    requestNotificationsCount
  } = useSocket();
  
  useEffect(() => {
    if (isConnected) {
      requestUnreadMessagesCount();
      requestUnclaimedTasksCount();
      requestFriendRequestsCount();
      requestNotificationsCount();
    }
  }, [isConnected, requestUnreadMessagesCount, requestUnclaimedTasksCount, requestFriendRequestsCount, requestNotificationsCount]);
  
  return {
    unreadMessagesCount,
    unclaimedTasksCount,
    friendRequestsCount,
    notificationsCount,
    isLoading: !isConnected,
    error: !isConnected ? new Error('Socket not connected') : null
  };
};

// Hook to get intro status via Socket.IO
export const useIntroStatusData = () => {
  const { introStatus, isConnected, requestIntroStatus } = useSocket();
  
  useEffect(() => {
    if (isConnected) {
      requestIntroStatus();
    }
  }, [isConnected, requestIntroStatus]);
  
  return {
    introStatus,
    isLoading: !isConnected || !introStatus,
    error: !isConnected ? new Error('Socket not connected') : null
  };
}; 