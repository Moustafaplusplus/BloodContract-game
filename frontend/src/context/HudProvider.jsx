// frontend/src/context/HudProvider.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';          // pnpm add jwt-decode (small, no deps)

const HudContext = createContext(null);

/* ------------------------------------------------------------------ */
/*  🔌  Convenience hooks                                              */
/* ------------------------------------------------------------------ */
export const useHud   = () => useContext(HudContext);      // stats-only (legacy)
export const useAuth  = () => useContext(HudContext);      // user + stats  (new)

/* ------------------------------------------------------------------ */
/*  🌐  Provider                                                       */
/* ------------------------------------------------------------------ */
export function HudProvider({ children }) {
  // live HUD bars
  const [stats, setStats] = useState({
    energy: 0,
    health: 0,
    courage: 0,
    will:   0,
  });

  // logged-in player
  const [user, setUser]   = useState(null);

  /* -------- Establish WebSocket & fetch user from localStorage ---- */
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return; // not logged in

    try {
      setUser(jwtDecode(token));            // { _id, username, … }
    } catch { /* invalid token – ignore */ }

    const socket = io(import.meta.env.VITE_API_URL, {
      path: '/ws',
      auth: { token },
    });

    socket.on('hud:update', setStats);

    return () => socket.disconnect();
  }, []);

  /* -------- Provider value ---------------------------------------- */
  const value = {
    user,            // the decoded player object
    stats,           // live energy / health etc.
    setUser,         // expose setter in case you later add login / logout
  };

  return <HudContext.Provider value={value}>{children}</HudContext.Provider>;
}
