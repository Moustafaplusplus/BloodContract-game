/**
 * Get the real IP address from the request
 * Handles various proxy scenarios and headers
 */
export function getRealIpAddress(req) {
  // Check for various headers that might contain the real IP
  const possibleHeaders = [
    'x-forwarded-for',
    'x-real-ip',
    'x-client-ip',
    'x-forwarded',
    'x-cluster-client-ip',
    'forwarded-for',
    'forwarded',
    'cf-connecting-ip', // Cloudflare
    'x-forwarded-for-original'
  ];

  for (const header of possibleHeaders) {
    const value = req.headers[header];
    if (value) {
      // Handle comma-separated IPs (take the first one)
      const ip = value.split(',')[0].trim();
      if (isValidIp(ip)) {
        return ip;
      }
    }
  }

  // Fallback to connection remote address
  return req.connection?.remoteAddress || 
         req.socket?.remoteAddress || 
         req.ip || 
         'unknown';
}

/**
 * Validate if an IP address is valid
 */
function isValidIp(ip) {
  if (!ip || typeof ip !== 'string') return false;
  
  // Remove IPv6 prefix if present
  const cleanIp = ip.replace(/^::ffff:/, '');
  
  // Basic IPv4 validation
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  
  // Basic IPv6 validation (simplified)
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
  
  return ipv4Regex.test(cleanIp) || ipv6Regex.test(ip);
}

/**
 * Get user agent from request
 */
export function getUserAgent(req) {
  return req.headers['user-agent'] || 'unknown';
} 