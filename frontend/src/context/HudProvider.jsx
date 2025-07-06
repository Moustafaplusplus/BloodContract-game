import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { connectSocket } from '../services/socket'; // ← keep your helper

/* ---------- Helpers ---------- */

/** Tiny, dependency-free JWT decoder (payload only). */
function decodeJwt(token) {
  try {
    const [, base64] = token.split('.');
    return JSON.parse(atob(base64));
  } catch (err) {
    console.warn('JWT decode error:', err);
    return null;
  }
}

/* ---------- Context ---------- */

const HudContext = createContext({
  user: null,
  stats: {
    money: 0,
    power: 0,
    defense: 0,
    energy: 0,
    level: 1,
    exp: 0,
    hp: 0,
  },
  setUser: () => {},
});

/* ---------- Public Hooks ---------- */

export const useAuth = () => {
  const { user, setUser } = useContext(HudContext);
  return { user, setUser, isAuthenticated: Boolean(user) };
};

export const useHud = () => useContext(HudContext).stats;

/* ---------- Provider ---------- */

export function HudProvider({ children }) {
  const [stats, setStats] = useState({
    money: 0,
    power: 0,
    defense: 0,
    energy: 0,
    level: 1,
    exp: 0,
    hp: 0,
  });
  const [user, setUser] = useState(null);

  /* 1️⃣  Bootstrapping & WebSocket */
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setUser(decodeJwt(token));

    const socket = connectSocket(token);
    socket.on('hud:update', setStats);
    socket.on('connect_error', (err) =>
      console.warn('WebSocket error:', err.message),
    );

    return () => socket.disconnect();
  }, []);

  /* Avoid prop-drilling re-renders */
  const ctxValue = useMemo(() => ({ user, stats, setUser }), [user, stats]);

  return <HudContext.Provider value={ctxValue}>{children}</HudContext.Provider>;
}
