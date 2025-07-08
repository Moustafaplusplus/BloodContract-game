// src/hooks/useAuth.js
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(null);
  const [tokenLoaded, setTokenLoaded] = useState(false);

  /* ---------- load token from localStorage on mount ---------- */
  useEffect(() => {
    const saved = localStorage.getItem('jwt');
    if (saved) setTokenState(saved);
    setTokenLoaded(true);
  }, []);

  /* ---------- axios interceptor (attach auth header) ---------- */
  useEffect(() => {
    const id = axios.interceptors.request.use((config) => {
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    return () => axios.interceptors.request.eject(id);
  }, [token]);

  /* ---------- helpers ---------- */
  const setToken = useCallback((jwt) => {
    localStorage.setItem('jwt', jwt);
    setTokenState(jwt);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('jwt');
    setTokenState(null);
  }, []);

  const value = {
    token,
    isAuthed: !!token,
    tokenLoaded,
    setToken,
    logout,
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

/* ---------- convenience hook ---------- */
export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
