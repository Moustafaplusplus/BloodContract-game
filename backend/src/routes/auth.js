import express from 'express';
import { UserController } from '../controllers/UserController.js';
import { firebaseAuth } from '../middleware/firebaseAuth.js';
import admin from 'firebase-admin';

// Import Firebase configuration to ensure it's initialized
import '../config/firebase.js';

const router = express.Router();

// Firebase token verification endpoint
router.post('/firebase-token', async (req, res) => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      return res.status(400).json({ message: 'No Firebase ID token provided' });
    }
    
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const firebaseUid = decodedToken.uid;
    
    // Check if user exists in our database
    const { User } = await import('../models/User.js');
    const { Character } = await import('../models/Character.js');
    
    let user = await User.findOne({ where: { firebaseUid } });
    let isNewUser = false;
    
    if (!user) {
      // Create new user from Firebase auth
      const isAnonymous = decodedToken.provider_id === 'anonymous' || !decodedToken.email;
      const email = decodedToken.email || `${firebaseUid}@anonymous.local`;
      const displayName = decodedToken.name || decodedToken.display_name || 'User';
      const photoURL = decodedToken.picture;
      
      // Generate username for anonymous users
      let username;
      if (isAnonymous) {
        // For anonymous users, generate a short username
        const randomSuffix = Math.random().toString(36).substring(2, 6);
        username = `ضيف_${randomSuffix}`;
      } else {
        // For regular users, use display name or email
        username = displayName.replace(/\s+/g, '_').toLowerCase();
        if (!username || username === 'user') {
          // Use email prefix if no display name
          username = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
        }
      }
      
      // Ensure username is within length limits (3-20 characters)
      if (username.length > 20) {
        username = username.substring(0, 17) + '...';
      }
      if (username.length < 3) {
        username = username + '123';
      }
      
      let counter = 1;
      let finalUsername = username;
      
      // Ensure unique username
      while (await User.findOne({ where: { username: finalUsername } })) {
        const suffix = counter.toString();
        finalUsername = username.substring(0, 20 - suffix.length - 1) + '_' + suffix;
        counter++;
      }
      
      // Check if email already exists (for email/password users)
      const existingUserByEmail = await User.findOne({ where: { email } });
      if (existingUserByEmail) {
        // Link existing user to Firebase
        existingUserByEmail.firebaseUid = firebaseUid;
        await existingUserByEmail.save();
        user = existingUserByEmail;
        isNewUser = false;
      } else {
        // Create new user
        user = await User.create({
          username: finalUsername,
          email,
          firebaseUid,
          age: 18, // Default age
          gender: 'male', // Default gender
          password: Math.random().toString(36).slice(-10), // Random password for Firebase users
          avatarUrl: photoURL,
          isGuest: isAnonymous // Mark as guest if anonymous
        });

        // Create character for new user
        await Character.create({
          userId: user.id,
          name: finalUsername
        });
        
        isNewUser = true;
      }
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isGuest: user.isGuest || false,
        hasSeenIntro: user.hasSeenIntro || false
      },
      isNewUser
    });
  } catch (error) {
    console.error('❌ Firebase token verification error:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack
    });
    
    // Check if it's a Firebase Admin initialization error
    if (error.message?.includes('Firebase Admin SDK not initialized')) {
      res.status(500).json({ message: 'Firebase Admin SDK not initialized' });
    } else if (error.code === 'auth/id-token-expired') {
      res.status(401).json({ message: 'Token expired. Please sign in again.' });
    } else if (error.code === 'auth/id-token-revoked') {
      res.status(401).json({ message: 'Token revoked. Please sign in again.' });
    } else if (error.code === 'auth/invalid-id-token') {
      res.status(401).json({ message: 'Invalid token format.' });
    } else {
      res.status(401).json({ message: 'Invalid Firebase token' });
    }
  }
});

// Guest login route (now handled by Firebase anonymous auth)
router.post('/guest', async (req, res) => {
  try {
    // This endpoint is now deprecated since guest auth is handled by Firebase
    res.status(400).json({ 
      message: 'Guest authentication is now handled by Firebase. Please use the frontend Firebase Auth.' 
    });
  } catch (error) {
    console.error('Guest login error:', error);
    res.status(500).json({ message: 'Guest login failed', error: error.message });
  }
});

// Sync guest account to registered account
router.post('/sync-guest', firebaseAuth, UserController.syncGuestAccount);

// Mark intro as seen
router.post('/mark-intro-seen', firebaseAuth, UserController.markIntroAsSeen);

// Get intro status
router.get('/intro-status', firebaseAuth, UserController.getIntroStatus);

// Check if user is authenticated
router.get('/status', firebaseAuth, (req, res) => {
  res.json({ 
    authenticated: true, 
    user: req.user 
  });
});

export default router; 