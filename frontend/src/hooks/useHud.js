/* -------------------- src/hooks/useHud.js --------------------- */
import { useEffect, useState, useCallback, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';

/**
 * Central HUD store.
 *  • Subscribes to 'hud:update' on the shared socket
 *  • Exposes current snapshot, loading flag, and invalidateHud() to force a refresh
 *  • Properly handles user changes and cache invalidation
 */
export function useHud() {
  const { socket } = useSocket();
  const { customToken, user } = useFirebaseAuth();
  const [hud, setHud] = useState(null);
  const [loading, setLoading] = useState(false);
  const currentUserIdRef = useRef(null);
  const hasRequestedInitialDataRef = useRef(false);
  const [socketConnected, setSocketConnected] = useState(false);

  // Extract userId from token for tracking user changes
  const getUserIdFromToken = useCallback(() => {
    if (!customToken) return null;
    try {
      const payload = JSON.parse(atob(customToken.split('.')[1]));
      return payload.id;
    } catch {
      return null;
    }
  }, [customToken]);

  /* ─── helper callable from any component ─── */
  const invalidateHud = useCallback(() => {
    if (socket && socket.connected && user) {
      socket.emit('hud:request');
    }
  }, [socket, user]);

  /* ─── track socket connection state ─── */
  useEffect(() => {
    if (!socket) {
      setSocketConnected(false);
      return;
    }

    const handleConnect = () => {
      setSocketConnected(true);
      if (!hasRequestedInitialDataRef.current && user) {
        hasRequestedInitialDataRef.current = true;
        invalidateHud();
      }
    };

    const handleDisconnect = () => {
      setSocketConnected(false);
      hasRequestedInitialDataRef.current = false;
    };

    // Set initial connection state
    setSocketConnected(socket.connected);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    // If already connected, request data
    if (socket.connected && !hasRequestedInitialDataRef.current && user) {
      hasRequestedInitialDataRef.current = true;
      invalidateHud();
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, [socket, user, invalidateHud]);

  /* ─── handle user changes ─── */
  useEffect(() => {
    const newUserId = getUserIdFromToken();
    
    if (newUserId !== currentUserIdRef.current) {
      currentUserIdRef.current = newUserId;
      hasRequestedInitialDataRef.current = false;
      
      // Reset HUD data when user changes
      setHud(null);
      setLoading(true);
    }
  }, [customToken, getUserIdFromToken]);

  /* ─── wire socket listener ─── */
  useEffect(() => {
    if (!socket || !user) {
      // Reset HUD data when socket is null or user is not authenticated
      setHud(null);
      setLoading(false);
      hasRequestedInitialDataRef.current = false;
      return;
    }

    const handleUpdate = (snapshot) => {
      const currentUserId = getUserIdFromToken();
      
      // Only update HUD if the data is for the current user
      if (snapshot?.userId === currentUserId) {
        setHud(snapshot);
        setLoading(false);
      }
    };

    socket.on('hud:update', handleUpdate);

    return () => {
      socket.off('hud:update', handleUpdate);
    };
  }, [socket, user, getUserIdFromToken]);

  /* ─── handle logout ─── */
  useEffect(() => {
    if (!user) {
      setHud(null);
      setLoading(false);
      currentUserIdRef.current = null;
      hasRequestedInitialDataRef.current = false;
      setSocketConnected(false);
    }
  }, [user]);

  // Set loading to false if we have data or if we're not authenticated
  useEffect(() => {
    if (hud || !user) {
      setLoading(false);
    }
  }, [hud, user]);

  return {
    stats: hud,
    loading: loading && user && !hud && socketConnected,
    invalidateHud,
  };
}

/* ------------------ END src/hooks/useHud.js ------------------- */
