/* -------------------- src/hooks/useHud.js --------------------- */
import { useEffect, useState, useCallback } from 'react';
import { useSocket } from '@/hooks/useSocket';

/**
 * Central HUD store.
 *  • Subscribes to 'hud:update' on the shared socket
 *  • Exposes current snapshot, loading flag, and invalidateHud() to force a refresh
 */
export function useHud() {
  const { socket } = useSocket();
  const [hud, setHud] = useState(null);

  /* ─── helper callable from any component ─── */
  const invalidateHud = useCallback(() => {
    socket?.emit('hud:request');
  }, [socket]);

  /* ─── wire socket listener ─── */
  useEffect(() => {
    if (!socket) return;

    const handleUpdate = (snapshot) => setHud(snapshot);

    socket.on('hud:update', handleUpdate);
    invalidateHud();            // grab initial state

    return () => socket.off('hud:update', handleUpdate);
  }, [socket, invalidateHud]);

  return {
    hud,
    loading: hud === null,
    invalidateHud,              // <— NEW
  };
}

/* ------------------ END src/hooks/useHud.js ------------------- */
