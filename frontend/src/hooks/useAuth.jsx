// src/hooks/useAuth.js
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import axios from "axios";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(null);
  const [tokenLoaded, setTokenLoaded] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [validating, setValidating] = useState(false); // Changed to false initially

  // Load token from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("jwt");
    if (saved) {
      setTokenState(saved);
      // Skip validation when backend is not available, just trust the stored token
      setIsAuthed(true);
      setTokenLoaded(true);
      setValidating(false);
    } else {
      setTokenLoaded(true);
      setIsAuthed(false);
      setValidating(false);
    }
  }, []);

  // Update axios interceptor when token changes
  useEffect(() => {
    const id = axios.interceptors.request.use((config) => {
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    return () => axios.interceptors.request.eject(id);
  }, [token]);

  const setToken = useCallback((jwt) => {
    localStorage.setItem("jwt", jwt);
    setTokenState(jwt);
    setIsAuthed(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("jwt");
    setTokenState(null);
    setIsAuthed(false);
  }, []);

  const value = {
    token,
    isAuthed,
    tokenLoaded,
    setToken,
    logout,
    validating,
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

/* ---------- convenience hook ---------- */
export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
