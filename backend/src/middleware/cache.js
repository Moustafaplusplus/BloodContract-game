import NodeCache from 'node-cache';

// Create a cache instance with 5 minutes TTL
const cache = new NodeCache({ stdTTL: 300 });

export const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = `${req.originalUrl || req.url}`;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      return res.json(cachedResponse);
    }

    // Store original send method
    const originalSend = res.json;

    // Override send method to cache the response
    res.json = function(data) {
      cache.set(key, data, duration);
      return originalSend.call(this, data);
    };

    next();
  };
};

export const clearCache = () => {
  cache.flushAll();
};

export default cache; 