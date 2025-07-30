import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

// Use DATABASE_URL if available (Railway), otherwise use individual parameters (local development)
const dbConfig = {
  dialect: 'postgres',
  logging: false,
  // Optimized connection pool for Railway
  pool: {
    max: 5, // Reduced for Railway limits
    min: 1, // Reduced for Railway limits
    acquire: 60000, // Increased for remote connection
    idle: 10000, // Increased for remote connection
    evict: 30000, // Increased for remote connection
  },
  // Add retry configuration for better connection stability
  retry: {
    max: 3, // Maximum number of retries
    timeout: 10000, // Timeout for each retry
  },
  // Optimized dialect options for Railway
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    connectTimeout: 60000, // Increased for remote connection
    acquireTimeout: 60000, // Increased for remote connection
    timeout: 60000, // Increased for remote connection
    // Add statement timeout to prevent long-running queries
    statement_timeout: 30000, // Increased for remote connection
    // Add idle session timeout
    idle_in_transaction_session_timeout: 30000, // Increased for remote connection
  },
};

// Create Sequelize instance based on available configuration
let sequelize;

if (process.env.DATABASE_URL) {
  // Use DATABASE_URL (Railway/Production)
  // If we're on Railway, use internal URL for better performance
  const dbUrl = process.env.RAILWAY_ENVIRONMENT 
    ? process.env.DATABASE_URL.replace('shuttle.proxy.rlwy.net', 'postgres.railway.internal')
    : process.env.DATABASE_URL;
  
  sequelize = new Sequelize(dbUrl, dbConfig);
} else {
  // Use individual parameters (Local Development)
  const localConfig = {
    ...dbConfig,
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || null,
    database: process.env.DB_NAME || 'blood_contract',
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 5432,
  };
  sequelize = new Sequelize(localConfig.database, localConfig.username, localConfig.password, localConfig);
}

// Connection event handlers (logs removed to reduce console spam)
sequelize.addHook('beforeConnect', async (config) => {
  // Connection attempt
});

sequelize.addHook('afterConnect', async (connection) => {
  // Connection established
});

sequelize.addHook('beforeDisconnect', async (connection) => {
  // Connection closing
});

// Error handling for connection issues
sequelize.addHook('afterDisconnect', async (connection) => {
  // Connection closed
});

// Test the connection
sequelize.authenticate()
  .then(() => {
    console.log('[DB] Database connection has been established successfully.');
  })
  .catch(err => {
    console.error('[DB] Unable to connect to the database:', err);
  });

export { sequelize };
export default sequelize;
