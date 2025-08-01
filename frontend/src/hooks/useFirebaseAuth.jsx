import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { 
  signInWithPopup, 
  signInAnonymously, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  linkWithCredential,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";
import { auth, googleProvider } from "@/config/firebase";
import axios from "axios";

// Set axios base URL - use VITE_API_URL if provided, otherwise use localhost:5000 in development
const API = import.meta.env.VITE_API_URL;
if (API) {
  axios.defaults.baseURL = API;
} else if (import.meta.env.MODE === 'development') {
  axios.defaults.baseURL = 'http://localhost:5000';
}

const FirebaseAuthCtx = createContext(null);

export function FirebaseAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [customToken, setCustomToken] = useState(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsGuest(firebaseUser.isAnonymous);
        
        // Get custom token from backend for API calls
        try {
          const idToken = await firebaseUser.getIdToken();
          const response = await axios.post('/api/auth/firebase-token', {
            idToken
          });
          
          if (response.data.token) {
            setCustomToken(response.data.token);
            // Save token to localStorage for AuthProvider compatibility
            localStorage.setItem('jwt', response.data.token);
            // Set axios interceptor with custom token
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
            // Dispatch custom event for AuthProvider to react to auth changes
            window.dispatchEvent(new CustomEvent('auth-change'));
          }
        } catch (error) {
          console.error('Failed to get custom token:', error);
        }
      } else {
        setUser(null);
        setIsGuest(false);
        setCustomToken(null);
        // Clear token from localStorage
        localStorage.removeItem('jwt');
        delete axios.defaults.headers.common['Authorization'];
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Check admin status when user changes
  useEffect(() => {
    if (user && !user.isAnonymous && customToken) {
      const checkAdminStatus = async () => {
        try {
          const response = await axios.get('/api/profile');
          setIsAdmin(response.data?.isAdmin || false);
        } catch (error) {
          console.error('Failed to check admin status:', error);
          setIsAdmin(false);
        }
      };
      checkAdminStatus();
    } else {
      setIsAdmin(false);
    }
  }, [user, customToken]);

  // Google Sign In
  const signInWithGoogle = useCallback(async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return { success: true, user: result.user };
    } catch (error) {
      console.error('Google sign in error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Email/Password Sign Up
  const signUpWithEmail = useCallback(async (email, password, userData) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with user data
      if (result.user) {
        await updateProfile(result.user, {
          displayName: userData.username,
          photoURL: userData.avatarUrl
        });
      }
      
      return { success: true, user: result.user };
    } catch (error) {
      console.error('Email sign up error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Email/Password Sign In
  const signInWithEmail = useCallback(async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: result.user };
    } catch (error) {
      console.error('Email sign in error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Guest Sign In
  const signInAsGuest = useCallback(async () => {
    try {
      const result = await signInAnonymously(auth);
      return { success: true, user: result.user };
    } catch (error) {
      console.error('Guest sign in error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Link guest account to Google account
  const linkGuestToGoogle = useCallback(async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      
      if (credential) {
        await linkWithCredential(auth.currentUser, credential);
        return { success: true, user: auth.currentUser };
      }
    } catch (error) {
      console.error('Link guest to Google error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Update user profile
  const updateUserProfile = useCallback(async (displayName, photoURL) => {
    try {
      await updateProfile(auth.currentUser, {
        displayName,
        photoURL
      });
      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Sign Out
  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      setCustomToken(null);
      // Clear token from localStorage
      localStorage.removeItem('jwt');
      delete axios.defaults.headers.common['Authorization'];
      // Dispatch custom event for AuthProvider to react to auth changes
      window.dispatchEvent(new CustomEvent('auth-change'));
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, []);

  const value = {
    user,
    loading,
    isAdmin,
    setIsAdmin,
    isGuest,
    customToken,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signInAsGuest,
    linkGuestToGoogle,
    updateUserProfile,
    logout,
  };

  return <FirebaseAuthCtx.Provider value={value}>{children}</FirebaseAuthCtx.Provider>;
}

/* ---------- convenience hook ---------- */
export function useFirebaseAuth() {
  const ctx = useContext(FirebaseAuthCtx);
  if (!ctx) throw new Error("useFirebaseAuth must be used within <FirebaseAuthProvider>");
  return ctx;
} 