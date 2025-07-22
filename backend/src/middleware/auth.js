import jwt from 'jsonwebtoken';
import { Character } from '../models/Character.js';
import { User, IpTracking } from '../models/index.js';
import { getRealIpAddress, getUserAgent } from '../utils/ipUtils.js';

const SECRET = process.env.JWT_SECRET;
if (!SECRET) throw new Error('JWT_SECRET environment variable is required');

export async function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No authentication token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, SECRET);
    if (!decoded?.id) {
      return res.status(403).json({ message: 'Invalid authentication token' });
    }

    // Get user and check for bans
    const user = await User.findByPk(decoded.id);
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

    // Check if this IP is blocked
    const ipBlock = await IpTracking.findOne({
      where: { 
        ipAddress,
        isBlocked: true 
      }
    });

    if (ipBlock) {
      return res.status(403).json({ 
        message: 'IP address blocked', 
        reason: ipBlock.blockReason || 'No reason provided',
        blockedAt: ipBlock.blockedAt
      });
    }

    // Track IP address
    try {
      await IpTracking.findOrCreate({
        where: { 
          userId: decoded.id,
          ipAddress 
        },
        defaults: {
          userAgent,
          lastSeen: new Date()
        }
      });

      // Update last seen if record exists
      await IpTracking.update(
        { lastSeen: new Date() },
        { where: { userId: decoded.id, ipAddress } }
      );

      // Update user's last IP
      await User.update(
        { lastIpAddress: ipAddress },
        { where: { id: decoded.id } }
      );
    } catch (e) {
      // Don't block request if IP tracking fails
      console.error('Failed to track IP:', e);
    }

    req.user = { id: decoded.id, characterId: decoded.characterId };
    
    // Update lastActive for the user's character
    if (decoded.id) {
      try {
        await Character.update(
          { lastActive: new Date() },
          { where: { userId: decoded.id } }
        );
      } catch (e) {
        // Don't block request if this fails
        console.error('Failed to update lastActive:', e);
      }
    }
    next();
  } catch (err) {
    const msg = err.name === 'TokenExpiredError' 
      ? 'Authentication token expired' 
      : 'Invalid authentication token';
    res.status(401).json({ message: msg });
  }
} 