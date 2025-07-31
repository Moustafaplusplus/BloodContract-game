// Time constants (in milliseconds)
export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  
  // Common intervals
  POLL_INTERVAL: 10 * 1000, // 10 seconds
  LONG_POLL_INTERVAL: 30 * 1000, // 30 seconds
  VERY_LONG_POLL_INTERVAL: 60 * 1000, // 1 minute
  
  // Animation durations
  FADE_DURATION: 2000, // 2 seconds
  SHORT_DELAY: 1000, // 1 second
  LONG_DELAY: 10000, // 10 seconds
  
  // Retry delays
  RETRY_DELAY: 1000, // 1 second
  MAX_RETRY_DELAY: 3000, // 3 seconds
};

// API cache times (in milliseconds)
export const CACHE_TIME = {
  SHORT: 30 * 1000, // 30 seconds
  MEDIUM: 60 * 1000, // 1 minute
  LONG: 5 * 60 * 1000, // 5 minutes
  VERY_LONG: 10 * 60 * 1000, // 10 minutes
};

// UI constants
export const UI = {
  MAX_QUOTE_LENGTH: 120,
  MAX_FILE_SIZE: 1024 * 1024, // 1MB
  MAX_RETRY_ATTEMPTS: 3,
  TOAST_DURATION: 4000, // 4 seconds
};

// Game constants
export const GAME = {
  ATTACK_IMMUNITY_DURATION: 5 * 60 * 1000, // 5 minutes
  ONLINE_THRESHOLD: 5 * 60 * 1000, // 5 minutes
  DEFAULT_COST: 1000,
  DEFAULT_MONEY_AMOUNT: 10000,
};

// Socket constants
export const SOCKET = {
  RECONNECTION_DELAY: 1000,
  TIMEOUT: 20000,
  PING_INTERVAL: 1000,
  PONG_TIMEOUT: 2000,
}; 