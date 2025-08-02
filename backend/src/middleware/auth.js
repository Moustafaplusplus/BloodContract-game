import jwt from 'jsonwebtoken';
import { Character } from '../models/Character.js';
import { User, IpTracking } from '../models/index.js';
import { getRealIpAddress, getUserAgent } from '../utils/ipUtils.js';

const SECRET = process.env.JWT_SECRET;
if (!SECRET) throw new Error('JWT_SECRET environment variable is required');

// Helper function to run database operations with timeout
async function withTimeout(promise, timeoutMs = 5000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database operation timed out')), timeoutMs)
    )
  ]);
}

export async function auth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ message: 'No authentication token provided' });
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No authentication token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, SECRET);
    if (!decoded?.id) {
      return res.status(403).json({ message: 'Invalid authentication token - missing user ID' });
    }

    // Get user and check for bans with timeout
    let user;
    try {
      user = await withTimeout(User.findByPk(decoded.id), 3000);
    } catch (dbError) {
      console.error('Auth middleware error - User lookup failed:', dbError.message);
      // If database is down, allow request to proceed with limited info
      req.user = { 
        id: decoded.id, 
        characterId: decoded.characterId,
        firebaseUid: decoded.firebaseUid 
      };
      return next();
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
      console.error('Auth middleware error - IP check failed:', dbError.message);
      // Continue without IP checking if database is unavailable
    }

    // Track IP address (non-blocking - run in background)
    setImmediate(async () => {
      try {
        await withTimeout(
          IpTracking.findOrCreate({
            where: { 
              userId: decoded.id,
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
            { where: { userId: decoded.id, ipAddress } }
          ),
          2000
        );

        // Update user's last IP
        await withTimeout(
          User.update(
            { lastIpAddress: ipAddress },
            { where: { id: decoded.id } }
          ),
          2000
        );
      } catch (e) {
        // Don't block request if IP tracking fails
        console.error('Failed to track IP:', e.message);
      }
    });

    req.user = { 
      id: decoded.id, 
      characterId: decoded.characterId,
      firebaseUid: decoded.firebaseUid 
    };
    
    // Update lastActive for the user's character (non-blocking)
    if (decoded.id) {
      setImmediate(async () => {
        try {
          await withTimeout(
            Character.update(
              { lastActive: new Date() },
              { where: { userId: decoded.id } }
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
    console.error('Auth middleware error:', err.message);
    const msg = err.name === 'TokenExpiredError' 
      ? 'Authentication token expired' 
      : 'Invalid authentication token';
    res.status(401).json({ message: msg });
  }
}
