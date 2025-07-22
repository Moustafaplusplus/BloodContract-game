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
    max: 20, // Maximum number of connection instances
    min: 5,  // Minimum number of connection instances
    acquire: 60000, // Maximum time (ms) that pool will try to get connection before throwing error
    idle: 10000, // Maximum time (ms) that a connection can be idle before being released
  },
  // Add retry configuration for better connection stability
  retry: {
    max: 3, // Maximum number of retries
    timeout: 10000, // Timeout for each retry
  },
  // Add dialect options for better connection handling
  dialectOptions: {
    connectTimeout: 60000, // Connection timeout
    acquireTimeout: 60000, // Acquire timeout
    timeout: 60000, // Query timeout
    // Add SSL configuration if needed
    // ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  },
};

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig);

// Add connection event handlers for better debugging
sequelize.addHook('beforeConnect', async (config) => {
  // Attempting database connection
});

sequelize.addHook('afterConnect', async (connection) => {
  // Database connection established
});

sequelize.addHook('beforeDisconnect', async (connection) => {
  // Database connection closing
});

export { sequelize };
export default sequelize;
