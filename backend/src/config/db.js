import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const dbConfig = {
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  host:     process.env.DB_HOST,
  port:     Number(process.env.DB_PORT),
  dialect:  'postgres',
  logging: false,
  // Add connection pool configuration to prevent connection exhaustion
  pool: {
    max: 10, // Reduced from 20 to prevent connection exhaustion
    min: 2,  // Reduced from 5
    acquire: 30000, // Reduced from 60000
    idle: 5000, // Reduced from 10000
    evict: 15000, // Reduced from 30000
  },
  // Add retry configuration for better connection stability
  retry: {
    max: 3, // Maximum number of retries
    timeout: 10000, // Timeout for each retry
  },
  // Add dialect options for better connection handling
  dialectOptions: {
    connectTimeout: 30000, // Reduced from 60000
    acquireTimeout: 30000, // Reduced from 60000
    timeout: 30000, // Reduced from 60000
    // Add SSL configuration if needed
    // ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    // Add statement timeout to prevent long-running queries
    statement_timeout: 15000, // Reduced from 30000
    // Add idle session timeout
    idle_in_transaction_session_timeout: 15000, // Reduced from 30000
  },
};

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig);

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
