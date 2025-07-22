// src/hooks/useAuth.js
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import axios from "axios";

// Set axios base URL
const API = import.meta.env.VITE_API_URL;
if (API) {
  axios.defaults.baseURL = API;
}

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(null);
  const [tokenLoaded, setTokenLoaded] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [validating, setValidating] = useState(false); // Changed to false initially
  const [isAdmin, setIsAdmin] = useState(false);

  // Load token from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("jwt");
    if (saved) {
      setTokenState(saved);
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

    // Add response interceptor to handle blocked users
    const responseId = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 403 && error.response?.data?.message?.includes('blocked')) {
          // User is blocked, show message and logout
          const reason = error.response.data.reason || 'No reason provided';
          alert(`تم حظر حسابك: ${reason}`);
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(id);
      axios.interceptors.response.eject(responseId);
    };
  }, [token]);

  // Check admin status after token is set and axios interceptor is configured
  useEffect(() => {
    if (token && isAuthed) {
      const checkAdminStatus = async () => {
        try {
          const response = await axios.get('/api/character');
          if (response.data?.User?.isAdmin) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch {
          setIsAdmin(false);
        }
      };
      checkAdminStatus();
    }
  }, [token, isAuthed]);

  const setToken = useCallback(async (jwt) => {
    localStorage.setItem("jwt", jwt);
    setTokenState(jwt);
    setIsAuthed(true);
    
    // Check if user is admin
    try {
      const response = await axios.get('/api/character');
      if (response.data?.User?.isAdmin) {
        setIsAdmin(true);
      }
    } catch {
      // Silently handle admin check errors
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("jwt");
    setTokenState(null);
    setIsAuthed(false);
    setIsAdmin(false);
  }, []);

  const value = {
    token,
    isAuthed,
    tokenLoaded,
    setToken,
    logout,
    validating,
    isAdmin,
    setIsAdmin,
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

/* ---------- convenience hook ---------- */
export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
