import admin from 'firebase-admin';
import { User, IpTracking } from '../models/index.js';
import { getRealIpAddress, getUserAgent } from '../utils/ipUtils.js';

// Import Firebase configuration to ensure it's initialized
import '../config/firebase.js';

// Helper function to run database operations with timeout
async function withTimeout(promise, timeoutMs = 8000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database operation timed out')), timeoutMs)
    )
  ]);
}

export async function firebaseAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ message: 'No authentication token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No authentication token provided' });
  }
  
  try {
    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const firebaseUid = decodedToken.uid;
    
    // Get user from database by Firebase UID
    let user;
    try {
      user = await withTimeout(User.findOne({ where: { firebaseUid } }), 3000);
    } catch (dbError) {
      console.error('Firebase auth middleware error - User lookup failed:', dbError.message);
      return res.status(500).json({ message: 'Database error during authentication' });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is banned
    if (user.isBanned) {
      return res.status(403).json({ 
        message: 'Account blocked', 
        reason: user.banReason || 'No reason provided',
        bannedAt: user.bannedAt
      });
    }

    // Get IP address and check for IP bans
    const ipAddress = getRealIpAddress(req);
    const userAgent = getUserAgent(req);

    // Check if this IP is blocked (non-blocking)
    try {
      const ipBlock = await withTimeout(
        IpTracking.findOne({
          where: { 
            ipAddress,
            isBlocked: true 
          }
        }),
        2000
      );

      if (ipBlock) {
        return res.status(403).json({ 
          message: 'IP address blocked', 
          reason: ipBlock.blockReason || 'No reason provided',
          blockedAt: ipBlock.blockedAt
        });
      }
    } catch (dbError) {
      console.error('Firebase auth middleware error - IP check failed:', dbError.message);
      // Continue without IP checking if database is unavailable
    }

    // Track IP address (non-blocking - run in background)
    setImmediate(async () => {
      try {
        await withTimeout(
          IpTracking.findOrCreate({
            where: { 
              userId: user.id,
              ipAddress 
            },
            defaults: {
              userAgent,
              lastSeen: new Date()
            }
          }),
          2000
        );

        // Update last seen if record exists
        await withTimeout(
          IpTracking.update(
            { lastSeen: new Date() },
            { where: { userId: user.id, ipAddress } }
          ),
          2000
        );

        // Update user's last IP
        await withTimeout(
          User.update(
            { lastIpAddress: ipAddress },
            { where: { id: user.id } }
          ),
          2000
        );
      } catch (e) {
        // Don't block request if IP tracking fails
        console.error('Failed to track IP:', e.message);
      }
    });

    // Set user info in request
    req.user = { 
      id: user.id, 
      characterId: user.characterId,
      firebaseUid: user.firebaseUid 
    };
    
    // Update lastActive for the user's character (non-blocking)
    if (user.id) {
      setImmediate(async () => {
        try {
          const { Character } = await import('../models/Character.js');
          await withTimeout(
            Character.update(
              { lastActive: new Date() },
              { where: { userId: user.id } }
            ),
            2000
          );
        } catch (e) {
          // Don't block request if this fails - character might not exist yet
          console.error('Failed to update lastActive:', e.message);
        }
      });
    }
    
    next();
  } catch (err) {
    console.error('Firebase auth middleware error:', err.message);
    console.error('Firebase auth middleware error details:', {
      name: err.name,
      code: err.code,
      message: err.message,
      stack: err.stack
    });
    
    let msg = 'Invalid authentication token';
    if (err.code === 'auth/id-token-expired') {
      msg = 'Authentication token expired';
    } else if (err.code === 'auth/id-token-revoked') {
      msg = 'Authentication token revoked';
    } else if (err.code === 'auth/invalid-id-token') {
      msg = 'Invalid token format';
    }
    
    res.status(401).json({ message: msg });
  }
} 