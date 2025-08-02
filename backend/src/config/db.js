import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

// Use DATABASE_URL if available (Railway), otherwise use individual parameters (local development)
const dbConfig = {
  dialect: 'postgres',
  logging: false, // Set to console.log for debugging if needed
  // Optimized connection pool for Railway with aggressive timeouts
  pool: {
    max: 3, // Further reduced for Railway limits
    min: 0, // Allow connections to drop to 0 when idle
    acquire: 30000, // Reduced timeout for acquiring connections
    idle: 5000, // Reduced idle time before releasing connections
    evict: 10000, // Reduced eviction time
    handleDisconnects: true, // Enable automatic reconnection
  },
  // Add retry configuration for better connection stability
  retry: {
    max: 5, // Increased retry attempts
    timeout: 5000, // Reduced timeout per retry
    backoffBase: 1000, // Base backoff time
    backoffExponent: 1.5, // Exponential backoff
  },
  // Optimized dialect options for Railway with shorter timeouts
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    connectTimeout: 20000, // Reduced connection timeout
    acquireTimeout: 20000, // Reduced acquire timeout
    timeout: 15000, // Reduced query timeout
    // Add statement timeout to prevent long-running queries
    statement_timeout: 10000, // Reduced statement timeout
    // Add idle session timeout
    idle_in_transaction_session_timeout: 15000, // Reduced idle timeout
    // Additional connection optimizations
    application_name: 'blood_contract_game',
    tcp_keepalives_idle: 600,
    tcp_keepalives_interval: 30,
    tcp_keepalives_count: 3,
  },
  // Add query timeout at Sequelize level
  define: {
    charset: 'utf8',
    timestamps: true,
  },
  // Add transaction settings
  transactionType: 'IMMEDIATE',
  isolationLevel: 'READ_COMMITTED',
};

// Create Sequelize instance based on available configuration
let sequelize;

// For local development, always use local database
if (process.env.NODE_ENV === 'development' && !process.env.RAILWAY_ENVIRONMENT) {
  // Use individual parameters (Local Development)
  const localConfig = {
    ...dbConfig,
    username: process.env.DB_USER || 'moustafaothman',
    password: process.env.DB_PASS || null,
    database: process.env.DB_NAME || 'blood_contract',
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 5432,
  };
  console.log('[DB] Using local database connection');
  sequelize = new Sequelize(localConfig.database, localConfig.username, localConfig.password, localConfig);
} else if (process.env.DATABASE_URL) {
  // Use DATABASE_URL (Railway/Production)
  // If we're on Railway, use internal URL for better performance
  const dbUrl = process.env.RAILWAY_ENVIRONMENT 
    ? process.env.DATABASE_URL.replace('shuttle.proxy.rlwy.net', 'postgres.railway.internal')
    : process.env.DATABASE_URL;
  
  console.log('[DB] Using Railway database connection');
  sequelize = new Sequelize(dbUrl, dbConfig);
} else {
  // Fallback to local database
  const localConfig = {
    ...dbConfig,
    username: process.env.DB_USER || 'moustafaothman',
    password: process.env.DB_PASS || null,
    database: process.env.DB_NAME || 'blood_contract',
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 5432,
  };
  console.log('[DB] Using local database connection (fallback)');
  sequelize = new Sequelize(localConfig.database, localConfig.username, localConfig.password, localConfig);
}

// Enhanced connection event handlers
sequelize.addHook('beforeConnect', async (config) => {
  console.log('[DB] Attempting connection...');
});

sequelize.addHook('afterConnect', async (connection) => {
  console.log('[DB] Connection established successfully');
});

sequelize.addHook('beforeDisconnect', async (connection) => {
  console.log('[DB] Disconnecting from database...');
});

// Error handling for connection issues with retry mechanism
sequelize.addHook('afterDisconnect', async (connection) => {
  console.log('[DB] Disconnected from database');
});

// Enhanced connection retry mechanism
async function connectWithRetry(maxRetries = 5) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`[DB] Database connection attempt ${i + 1}/${maxRetries}...`);
      await sequelize.authenticate();
      console.log('[DB] Database connection has been established successfully.');
      return;
    } catch (err) {
      console.error(`[DB] Connection attempt ${i + 1} failed:`, err.message);
      
      if (i === maxRetries - 1) {
        console.error('[DB] All connection attempts failed. Application may not function properly.');
        throw err;
      }
      
      // Wait before retrying (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, i), 10000);
      console.log(`[DB] Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Initialize connection with retry
connectWithRetry().catch(err => {
  console.error('[DB] Failed to establish initial database connection:', err);
});

// Add graceful shutdown handler
process.on('SIGINT', async () => {
  console.log('[DB] Closing database connection...');
  try {
    await sequelize.close();
    console.log('[DB] Database connection closed.');
  } catch (err) {
    console.error('[DB] Error closing database connection:', err);
  }
});

process.on('SIGTERM', async () => {
  console.log('[DB] Closing database connection...');
  try {
    await sequelize.close();
    console.log('[DB] Database connection closed.');
  } catch (err) {
    console.error('[DB] Error closing database connection:', err);
  }
});

export { sequelize };
export default sequelize;
