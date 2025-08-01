import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInAnonymously } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBjk_9-I6LYbVcBRyecX1sm8GhyyFwcdow",
  authDomain: "bloodcontractgame.firebaseapp.com",
  projectId: "bloodcontractgame",
  storageBucket: "bloodcontractgame.firebasestorage.app",
  messagingSenderId: "369603097817",
  appId: "1:369603097817:web:ab276f84329d215c40fac8",
  measurementId: "G-ZSBKEJ751W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Analytics (optional)
export const analytics = getAnalytics(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Export the app instance
export default app; 