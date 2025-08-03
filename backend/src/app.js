//  backend/src/app.js – unified DB + Socket.IO bootstrap (feature barrels)
import express  from 'express';
import cors     from 'cors';
import morgan   from 'morgan';
import dotenv   from 'dotenv';
import http     from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import session from 'express-session';

// Load environment variables first
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { DataTypes } from 'sequelize';
import { sequelize } from './config/db.js';

/* ─────────── Export for tests ─────────── */
export { sequelize };

/* ─────────── Feature barrels ─────────── */
import { User } from './models/User.js';
import userRouter from './routes/user.js';
import { Crime, CrimeLog } from './models/Crime.js';
import crimeRouter from './routes/crimes.js';
import { Character as CharacterModel } from './models/Character.js';
import characterRouter from './routes/character.js';
import { startEnergyRegen } from './jobs/energyRegen.js';
import { startHealthRegen } from './jobs/healthRegen.js';
import { startJailRelease } from './jobs/jailRelease.js';
import { startHospitalRelease } from './jobs/hospitalRelease.js';
import { startContractExpirationJob } from './jobs/contractExpiration.js';
import { Fight as FightModel } from './models/Fight.js';
import fightRouter from './routes/fight.js';
import { BankAccount } from './models/Bank.js';
import bankRouter from './routes/bank.js';
import { startBankInterest } from './jobs/bankInterest.js';
import { startJobPayouts } from './jobs/jobPayouts.js';
import { Jail as JailModel, Hospital as HospitalModel } from './models/Confinement.js';
import confinementRouter from './routes/confinement.js';

import { House as HouseModel, UserHouse as UserHouseModel } from './models/House.js';
import housesRouter from './routes/houses.js';
import { InventoryItem } from './models/Inventory.js';
import { Weapon, Armor } from './models/Shop.js';
import { SpecialItem } from './models/SpecialItem.js';
import shopRouter from './routes/shop.js';
import specialShopRouter from './routes/specialShop.js';
import inventoryRouter from './routes/inventory.js';
import specialItemsRouter from './routes/specialItems.js';

import jobsRouter from './routes/jobs.js';
import { Friendship } from './models/Friendship.js';
import { Message } from './models/Message.js';
import { Notification } from './models/Notification.js';


import profileRouter from './routes/profile.js';
import searchRouter from './routes/search.js';
import { errorHandler } from './middleware/errorHandler.js';
import { Car as CarModel } from './models/Car.js';
import carRouter from './routes/car.js';
import { Job as JobModel, JobHistory as JobHistoryModel } from './models/Job.js';
import blackMarketRouter from './routes/blackMarket.js';
import dogRoutes from './routes/dog.js';
import messageRoutes from './routes/message.js';
import friendshipRoutes from './routes/friendship.js';
import rankingRouter from './routes/ranking.js';
import gangRouter from './routes/gang.js';
import { Gang, GangMember, GangJoinRequest } from './models/Gang.js';
import { IpTracking } from './models/IpTracking.js';
import { MinistryMission, UserMinistryMission } from './models/MinistryMission.js';
import { Suggestion } from './models/Suggestion.js';
import { GlobalMessage } from './models/GlobalMessage.js';
import { ProfileRating } from './models/ProfileRating.js';
import adminCharacterRouter from './routes/adminCharacters.js';
import adminSystemRouter from './routes/adminSystem.js';
import ministryMissionsRouter from './routes/ministryMissions.js';
import suggestionsRouter from './routes/suggestions.js';
import globalChatRouter from './routes/globalChat.js';
import bloodContractsRouter from './routes/bloodContracts.js';
import { Task, UserTaskProgress } from './models/Task.js';
import tasksRouter from './routes/tasks.js';
import authRouter from './routes/auth.js';
import notificationRouter from './routes/notifications.js';

// Import Firebase configuration to ensure it's initialized
import './config/firebase.js';

import gameNewsRouter from './routes/gameNews.js';
import loginGiftRouter from './routes/loginGift.js';
import featuresRouter from './routes/features.js';

/* ─────────── Express bootstrapping ─────────── */
const app = express();

// Note: Static file serving removed - using Firebase Storage for image storage
// Static files are no longer served from the backend since Railway's filesystem is ephemeral
app.set('etag', false);                     // prevents 304 responses with empty body

// CORS configuration
const corsOptions = {
  origin: true, // Allow all origins for now
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));

// Session configuration for OAuth
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Firebase Auth is now handled by the frontend

// Basic route for immediate response
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Blood Contract API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || process.env.API_PORT || 3001
  });
});

// Simple health check endpoint (no database dependency)
app.get('/health-simple', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'Server is running',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await sequelize.authenticate();
    res.json({ 
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy',
      database: 'disconnected',
      timestamp: new Date().toISOString()
    });
  }
});

// Performance monitoring endpoint
app.get('/api/performance', (req, res) => {
  const memUsage = process.memoryUsage();
  res.json({
    memory: {
      rss: Math.round(memUsage.rss / 1024 / 1024) + ' MB',
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB'
    },
    uptime: process.uptime(),
    database: 'connected'
  });
});

// Debug endpoint to check environment variables
app.get('/api/debug/env', (req, res) => {
  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    API_PORT: process.env.API_PORT,
    DATABASE_URL: process.env.DATABASE_URL ? 'present' : 'missing',
    RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT,
    SESSION_SECRET: process.env.SESSION_SECRET ? 'present' : 'missing'
  };
  
  res.json({
    environment: envVars,
    timestamp: new Date().toISOString()
  });
});

// Debug endpoint to check Firebase environment variables
app.get('/api/debug/firebase', (req, res) => {
  const requiredEnvVars = [
    'FIREBASE_TYPE',
    'FIREBASE_PROJECT_ID', 
    'FIREBASE_PRIVATE_KEY_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_CLIENT_ID',
    'FIREBASE_AUTH_URI',
    'FIREBASE_TOKEN_URI',
    'FIREBASE_AUTH_PROVIDER_X509_CERT_URL',
    'FIREBASE_CLIENT_X509_CERT_URL',
    'FIREBASE_STORAGE_BUCKET'
  ];

  const envStatus = {};
  requiredEnvVars.forEach(varName => {
    const value = process.env[varName];
    envStatus[varName] = {
      present: !!value,
      length: value ? value.length : 0,
      preview: value ? (varName.includes('PRIVATE_KEY') ? `${value.substring(0, 20)}...` : value.substring(0, 50)) : null
    };
  });

  res.json({
    environment: process.env.NODE_ENV,
    firebase: envStatus,
    missing: requiredEnvVars.filter(varName => !process.env[varName])
  });
});

/* ─────────── Sequelize model auto-init (skip if already inited) ─────────── */
[
  User, CharacterModel,
  JailModel, HospitalModel, Crime, CrimeLog,
  Weapon, Armor, InventoryItem, SpecialItem,
  HouseModel, UserHouseModel,
  FightModel, BankAccount,
  CarModel,
  Friendship, Message,
  JobModel, JobHistoryModel,
  Gang, GangMember, GangJoinRequest,
  IpTracking, MinistryMission, UserMinistryMission, Suggestion, GlobalMessage, ProfileRating,
  Task, UserTaskProgress,
].forEach((M) => {
  if (M.sequelize || typeof M.init !== 'function') return; // already initialised
  M.init.length === 1 ? M.init(sequelize) : M.init(sequelize, DataTypes);
});

/* ─────────── Feature-barrel routers ─────────── */
app.use('/api/v1/search',        searchRouter);
app.use('/api',                  userRouter);
app.use('/api/crimes',           crimeRouter);
app.use('/api/character',        characterRouter);
app.use('/api/fight',            fightRouter);
app.use('/api/bank',             bankRouter);
app.use('/api/confinement',      confinementRouter);
app.use('/api/black-market',    blackMarketRouter);
app.use('/api/dogs', dogRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/friendship', friendshipRoutes);
app.use('/api/bloodcontracts', bloodContractsRouter);

app.use('/api/houses',           housesRouter);
app.use('/api/shop',             shopRouter);
app.use('/api/special-shop',     specialShopRouter);
app.use('/api/special-items',    specialItemsRouter);
app.use('/api/inventory',        inventoryRouter);

app.use('/api/jobs',             jobsRouter);

// app.use('/api/social',           socialRouter); // Social routes removed

app.use('/api/profile',          profileRouter);
app.use('/api/cars',             carRouter);

app.use('/api/ranking',          rankingRouter);

// Register gangs router
app.use('/api/gangs', gangRouter);

// Register modular admin routers
app.use('/api/admin/characters', adminCharacterRouter);
app.use('/api/admin', adminSystemRouter);

// Register ministry missions router
app.use('/api/ministry-missions', ministryMissionsRouter);

// Register suggestions router
app.use('/api/suggestions', suggestionsRouter);

// Register global chat router
app.use('/api/global-chat', globalChatRouter);

app.use('/api/tasks', tasksRouter);
app.use('/api/auth', authRouter);
app.use('/api/notifications', notificationRouter);

app.use('/api/game-news', gameNewsRouter);
app.use('/api/login-gift', loginGiftRouter);
app.use('/api/features', featuresRouter);

/* ─────────── Global error handler ─────────── */
app.use(errorHandler);

/* ─────────── Background jobs moved to startup function ─────────── */

/* ─────────── Bootstrapping ─────────── */
import { initSocket } from './socket.js';
const PORT = process.env.PORT || process.env.API_PORT || 3001;

// Start server
const startServer = async () => {
  const maxRetries = 5;
  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    try {
      await sequelize.authenticate();
      break;
    } catch (error) {
      retryCount++;
      if (retryCount >= maxRetries) {
        console.error('Failed to connect to database after multiple attempts');
        process.exit(1);
      }
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  try {
    await sequelize.sync({ alter: true });
  } catch (error) {
    console.error('Database sync error:', error);
  }
  
  // Initialize Socket.IO
  if (io) {
    // Socket.IO is already initialized
  }
  
  // Start background jobs
  try {
    startEnergyRegen();
    startHealthRegen();
    startBankInterest();
    startJobPayouts();
    startJailRelease();
    startHospitalRelease();
    startContractExpirationJob();
  } catch (error) {
    console.error('Background jobs error:', error);
  }
  
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
};

startServer();
