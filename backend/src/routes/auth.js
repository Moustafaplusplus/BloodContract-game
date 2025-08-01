import express from 'express';
import { UserController } from '../controllers/UserController.js';
import { auth } from '../middleware/auth.js';
import admin from 'firebase-admin';

const router = express.Router();

// Firebase token verification endpoint
router.post('/firebase-token', async (req, res) => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      console.error('❌ No Firebase ID token provided');
      return res.status(400).json({ message: 'No Firebase ID token provided' });
    }

    console.log('🔍 Verifying Firebase ID token...');
    
    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const firebaseUid = decodedToken.uid;
    
    console.log('✅ Firebase token verified for UID:', firebaseUid);
    console.log('🔍 Token details:', {
      uid: decodedToken.uid,
      email: decodedToken.email,
      provider_id: decodedToken.provider_id,
      isAnonymous: !decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture
    });
    
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
      
      // Generate username from display name or email
      let username = displayName.replace(/\s+/g, '_').toLowerCase();
      if (!username || username === 'user') {
        // Use email prefix if no display name
        username = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
      }
      
      let counter = 1;
      let finalUsername = username;
      
      // Ensure unique username
      while (await User.findOne({ where: { username: finalUsername } })) {
        finalUsername = `${username}_${counter}`;
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

    // Generate custom token for API calls
    const { UserService } = await import('../services/UserService.js');
    const token = UserService.generateCustomToken(user.id, user.firebaseUid);

    console.log('✅ Custom token generated for user:', user.id);
    res.json({
      token,
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
    
    // Provide more specific error messages
    if (error.code === 'auth/id-token-expired') {
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
router.post('/sync-guest', auth, UserController.syncGuestAccount);

// Mark intro as seen
router.post('/mark-intro-seen', auth, UserController.markIntroAsSeen);

// Get intro status
router.get('/intro-status', auth, UserController.getIntroStatus);

// Check if user is authenticated
router.get('/status', auth, (req, res) => {
  res.json({ 
    authenticated: true, 
    user: req.user 
  });
});

export default router; 