import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;
if (!SECRET) throw new Error('JWT_SECRET environment variable is required');

export function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No authentication token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, SECRET);
    if (!decoded?.id) {
      return res.status(403).json({ message: 'Invalid authentication token' });
    }
    req.user = { id: decoded.id, characterId: decoded.characterId };
    next();
  } catch (err) {
    const msg = err.name === 'TokenExpiredError' 
      ? 'Authentication token expired' 
      : 'Invalid authentication token';
    res.status(401).json({ message: msg });
  }
} 