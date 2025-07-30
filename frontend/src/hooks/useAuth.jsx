// src/hooks/useAuth.js
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import axios from "axios";

// Set axios base URL - only set if VITE_API_URL is provided and we're not in development
const API = import.meta.env.VITE_API_URL;
if (API && import.meta.env.MODE !== 'development') {
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
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor to handle blocked users and email verification
    const responseId = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle 401 errors by clearing invalid token
        if (error.response?.status === 401) {
          // Clear invalid token
          localStorage.removeItem("jwt");
          setTokenState(null);
          setIsAuthed(false);
          setIsAdmin(false);
          // Dispatch custom event for SocketContext to react to auth changes
          window.dispatchEvent(new CustomEvent('auth-change'));
        }
        
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
    if (token && isAuthed && tokenLoaded) {
      const checkAdminStatus = async (retryCount = 0) => {
        try {
          const response = await axios.get('/api/profile');
          if (response.data?.isAdmin) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          // Only log non-401 errors to avoid spam
          if (error.response?.status !== 401) {
            console.error('Failed to check admin status:', error);
          }
          
          // Retry once after a short delay if it's a 401 error (token might not be ready yet)
          if (error.response?.status === 401 && retryCount < 1) {
            setTimeout(() => checkAdminStatus(retryCount + 1), 200);
            return;
          }
          
          setIsAdmin(false);
        }
      };
      checkAdminStatus();
    }
  }, [token, isAuthed, tokenLoaded]);

  const setToken = useCallback(async (jwt) => {
    if (!jwt) {
      console.warn('Attempted to set null/undefined token');
      return;
    }
    
    localStorage.setItem("jwt", jwt);
    setTokenState(jwt);
    setIsAuthed(true);
    
    // Dispatch custom event for SocketContext to react to auth changes
    window.dispatchEvent(new CustomEvent('auth-change'));
    
    // Add a small delay to ensure axios interceptor is properly configured
    setTimeout(async () => {
      // Check if user is admin - only after token is properly set
      try {
        const response = await axios.get('/api/profile');
        if (response.data?.isAdmin) {
          setIsAdmin(true);
        }
      } catch (error) {
        // Only log non-401 errors to avoid spam
        if (error.response?.status !== 401) {
          console.error('Failed to check admin status during login:', error);
        }
        // Don't set admin status on error
      }
    }, 100); // 100ms delay to ensure interceptor is set
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("jwt");
    setTokenState(null);
    setIsAuthed(false);
    setIsAdmin(false);
    
    // Dispatch custom event for SocketContext to react to auth changes
    window.dispatchEvent(new CustomEvent('auth-change'));
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
