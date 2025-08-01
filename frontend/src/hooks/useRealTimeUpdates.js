import { useEffect, useCallback } from 'react';
import { useSocket } from './useSocket';
import { useHud } from './useHud';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

export const useRealTimeUpdates = () => {
  const { socket } = useSocket();
  const { invalidateHud } = useHud();
  const queryClient = useQueryClient();

  // HUD Updates
  const handleHudUpdate = useCallback((hudData) => {
    invalidateHud?.();
  }, [invalidateHud]);

  // Profile Updates
  const handleProfileUpdate = useCallback((profileData) => {
    // Invalidate profile queries
    queryClient.invalidateQueries(['character']);
    queryClient.invalidateQueries(['profile']);
  }, [queryClient]);

  // Friendship Updates
  const handleFriendshipUpdate = useCallback(({ targetUserId, isFriend, pendingStatus }) => {
    // Invalidate friendship-related queries
    queryClient.invalidateQueries(['friendship']);
    queryClient.invalidateQueries(['friends']);
    
    // Update local state if needed
    if (isFriend) {
      toast.success('تم إضافة صديق جديد!');
    } else if (pendingStatus === 'sent') {
      toast.success('تم إرسال طلب الصداقة');
    } else if (pendingStatus === 'received') {
      toast.success('لديك طلب صداقة جديد!');
    }
  }, [queryClient]);

  // Inventory Updates
  const handleInventoryUpdate = useCallback((inventory) => {
    queryClient.invalidateQueries(['inventory']);
    toast.success('تم تحديث المخزون');
  }, [queryClient]);

  // Bank Updates
  const handleBankUpdate = useCallback((bankData) => {
    queryClient.invalidateQueries(['bank']);
    toast.success('تم تحديث رصيد البنك');
  }, [queryClient]);

  // Task Updates
  const handleTaskUpdate = useCallback((tasks) => {
    queryClient.invalidateQueries(['tasks']);
    toast.success('تم تحديث المهام');
  }, [queryClient]);

  // Gang Updates
  const handleGangUpdate = useCallback((gangData) => {
    queryClient.invalidateQueries(['gang']);
    queryClient.invalidateQueries(['gangs']);
    toast.success('تم تحديث معلومات العصبة');
  }, [queryClient]);

  // Rankings Updates
  const handleRankingsUpdate = useCallback((rankings) => {
    queryClient.invalidateQueries(['rankings']);
  }, [queryClient]);

  // Hospital/Jail Updates
  const handleHospitalUpdate = useCallback(() => {
    queryClient.invalidateQueries(['hospital']);
    invalidateHud?.();
  }, [queryClient, invalidateHud]);

  const handleJailUpdate = useCallback(() => {
    queryClient.invalidateQueries(['jail']);
    invalidateHud?.();
  }, [queryClient, invalidateHud]);

  // Fight Result Updates
  const handleFightResult = useCallback((fightResult) => {
    queryClient.invalidateQueries(['character']);
    invalidateHud?.();
    
    // Show fight result notification
    if (fightResult.winner) {
      toast.success(`نتيجة المعركة: ${fightResult.winner.name} فاز!`);
    }
  }, [queryClient, invalidateHud]);

  // Notification Updates
  const handleNotification = useCallback((notification) => {
    // Update notifications list
    queryClient.invalidateQueries(['notifications']);
    
    // Show toast notification
    toast.success(notification.content);
  }, [queryClient]);

  // Global Chat Updates
  const handleGlobalMessage = useCallback((message) => {
    // Update global chat messages
    queryClient.invalidateQueries(['globalChat']);
  }, [queryClient]);

  // Private Message Updates
  const handleReceiveMessage = useCallback((message) => {
    // Update private messages
    queryClient.invalidateQueries(['messages']);
    
    // Show notification for new message
    toast.success(`رسالة جديدة من ${message.sender?.username || 'مستخدم'}`);
  }, [queryClient]);

  // Setup all socket listeners
  useEffect(() => {
    if (!socket) return;

    // HUD and Profile Updates
    socket.on('hud:update', handleHudUpdate);
    socket.on('profile:update', handleProfileUpdate);

    // Friendship Updates
    socket.on('friendship:update', handleFriendshipUpdate);

    // Game State Updates
    socket.on('inventory:update', handleInventoryUpdate);
    socket.on('bank:update', handleBankUpdate);
    socket.on('tasks:update', handleTaskUpdate);
    socket.on('gang:update', handleGangUpdate);
    socket.on('rankings:update', handleRankingsUpdate);

    // Confinement Updates
    socket.on('hospital:enter', handleHospitalUpdate);
    socket.on('hospital:leave', handleHospitalUpdate);
    socket.on('jail:enter', handleJailUpdate);
    socket.on('jail:leave', handleJailUpdate);

    // Fight Updates
    socket.on('fightResult', handleFightResult);

    // Notification Updates
    socket.on('notification', handleNotification);

    // Chat Updates
    socket.on('global_message', handleGlobalMessage);
    socket.on('receive_message', handleReceiveMessage);

    // Cleanup
    return () => {
      socket.off('hud:update', handleHudUpdate);
      socket.off('profile:update', handleProfileUpdate);
      socket.off('friendship:update', handleFriendshipUpdate);
      socket.off('inventory:update', handleInventoryUpdate);
      socket.off('bank:update', handleBankUpdate);
      socket.off('tasks:update', handleTaskUpdate);
      socket.off('gang:update', handleGangUpdate);
      socket.off('rankings:update', handleRankingsUpdate);
      socket.off('hospital:enter', handleHospitalUpdate);
      socket.off('hospital:leave', handleHospitalUpdate);
      socket.off('jail:enter', handleJailUpdate);
      socket.off('jail:leave', handleJailUpdate);
      socket.off('fightResult', handleFightResult);
      socket.off('notification', handleNotification);
      socket.off('global_message', handleGlobalMessage);
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [
    socket,
    handleHudUpdate,
    handleProfileUpdate,
    handleFriendshipUpdate,
    handleInventoryUpdate,
    handleBankUpdate,
    handleTaskUpdate,
    handleGangUpdate,
    handleRankingsUpdate,
    handleHospitalUpdate,
    handleJailUpdate,
    handleFightResult,
    handleNotification,
    handleGlobalMessage,
    handleReceiveMessage
  ]);

  // Helper functions to request updates
  const requestProfileUpdate = useCallback((targetUserId) => {
    if (socket) {
      socket.emit('profile:request', { targetUserId });
    }
  }, [socket]);

  const requestInventoryUpdate = useCallback(() => {
    if (socket) {
      socket.emit('inventory:request');
    }
  }, [socket]);

  const requestBankUpdate = useCallback(() => {
    if (socket) {
      socket.emit('bank:request');
    }
  }, [socket]);

  const requestTaskUpdate = useCallback(() => {
    if (socket) {
      socket.emit('tasks:request');
    }
  }, [socket]);

  const requestGangUpdate = useCallback((gangId) => {
    if (socket) {
      socket.emit('gang:request', { gangId });
    }
  }, [socket]);

  const requestRankingsUpdate = useCallback(() => {
    if (socket) {
      socket.emit('rankings:request');
    }
  }, [socket]);

  const requestHudUpdate = useCallback(() => {
    if (socket) {
      socket.emit('hud:request');
    }
  }, [socket]);

  return {
    // Request functions
    requestProfileUpdate,
    requestInventoryUpdate,
    requestBankUpdate,
    requestTaskUpdate,
    requestGangUpdate,
    requestRankingsUpdate,
    requestHudUpdate
  };
}; 