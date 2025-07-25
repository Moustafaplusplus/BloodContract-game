import express from 'express';
import passport from 'passport';
import { UserController } from '../controllers/UserController.js';

const router = express.Router();

// Google OAuth routes
router.get('/google', (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({ 
      message: 'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.' 
    });
  }
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res);
});

router.get('/google/callback', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({ 
      message: 'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.' 
    });
  }
  passport.authenticate('google', { session: false, failureRedirect: '/login' })(req, res, next);
}, (req, res) => {
  // Redirect to frontend with token
  const { token } = req.user;
  const redirectUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/callback?token=${token}`;
  res.redirect(redirectUrl);
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