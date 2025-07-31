import express from 'express';
import passport from 'passport';
import { UserController } from '../controllers/UserController.js';

const router = express.Router();

// Google OAuth routes
router.get('/google', (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.log('❌ Google OAuth not configured - missing environment variables');
    return res.status(503).json({ 
      message: 'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.' 
    });
  }
  
  console.log('🔐 Initiating Google OAuth flow');
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res);
});

router.get('/google/callback', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.log('❌ Google OAuth callback failed - missing environment variables');
    return res.status(503).json({ 
      message: 'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.' 
    });
  }
  
  console.log('🔄 Processing Google OAuth callback');
  passport.authenticate('google', { session: false, failureRedirect: '/login' })(req, res, next);
}, (req, res) => {
  try {
    // Redirect to frontend with token and new user status
    const { token, isNewUser } = req.user;
    const redirectUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/callback?token=${token}&isNewUser=${isNewUser}`;
    console.log('✅ Google OAuth successful, redirecting to:', redirectUrl);
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('❌ Google OAuth callback error:', error);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=google_auth_failed`);
  }
});

// Check if user is authenticated with Google
router.get('/google/status', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ authenticated: true, user: req.user });
  } else {
    res.json({ authenticated: false });
  }
});

export default router; 