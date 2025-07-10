//  backend/src/app.js – unified DB + Socket.IO bootstrap (feature barrels)
import express  from 'express';
import cors     from 'cors';
import morgan   from 'morgan';
import dotenv   from 'dotenv';
import http     from 'http';

import { DataTypes } from 'sequelize';
import { sequelize } from './config/db.js';
dotenv.config();

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
import { Fight as FightModel } from './models/Fight.js';
import fightRouter from './routes/fight.js';
import { BankAccount } from './models/Bank.js';
import bankRouter from './routes/bank.js';
import { startBankInterest } from './jobs/bankInterest.js';
import { Jail as JailModel, Hospital as HospitalModel } from './models/Confinement.js';
import confinementRouter from './routes/confinement.js';
import { Achievement, CharacterAchievement } from './models/Achievement.js';
import achievementRouter from './routes/achievements.js';
import { AchievementService } from './services/AchievementService.js';
import goldMarketRouter from './routes/gold.js';
import { House as HouseModel, UserHouse as UserHouseModel } from './models/House.js';
import housesRouter from './routes/houses.js';
import { InventoryItem } from './models/Inventory.js';
import { Weapon, Armor } from './models/Shop.js';
import shopRouter from './routes/shop.js';
import inventoryRouter from './routes/inventory.js';
import { ShopService } from './services/ShopService.js';
import blackMarketRouter from './routes/blackMarket.js';
import jobsRouter from './routes/jobs.js';
import { Friendship, Message, Notification } from './models/Social.js';
import socialRouter from './routes/social.js';
import gangRouter from './routes/gang.js';
import { Event, EventParticipation } from './models/Event.js';
import eventRouter from './routes/events.js';
import profileRouter from './routes/profile.js';
import searchRouter from './routes/search.js';
import { errorHandler } from './middleware/errorHandler.js';
import { Car as CarModel } from './models/Car.js';
import carRouter from './routes/car.js';

/* ─────────── Sequelize model auto-init (skip if already inited) ─────────── */
[
  User, CharacterModel, Achievement, CharacterAchievement,
  JailModel, HospitalModel, Crime, CrimeLog,
  Weapon, Armor, InventoryItem,
  HouseModel, UserHouseModel,
  FightModel, BankAccount,
  Event, EventParticipation, CarModel,
  Friendship, Message, Notification,
].forEach((M) => {
  if (M.sequelize || typeof M.init !== 'function') return; // already initialised
  M.init.length === 1 ? M.init(sequelize) : M.init(sequelize, DataTypes);
});

/* ─────────── Express bootstrapping ─────────── */
const app = express();

app.set('etag', false);                     // prevents 304 responses with empty body
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));
app.get('/', (_req, res) => res.send('🎉 Backend is working!'));

/* ─────────── Feature-barrel routers ─────────── */
app.use('/api/v1/search',        searchRouter);
app.use('/api',                  userRouter);
app.use('/api/crimes',           crimeRouter);
app.use('/api/character',        characterRouter);
app.use('/api/fight',            fightRouter);
app.use('/api/bank',             bankRouter);
app.use('/api/confinement',      confinementRouter);
app.use('/api/achievements',     achievementRouter);
app.use('/gold-market',          goldMarketRouter);
app.use('/api/houses',           housesRouter);
app.use('/api/shop',             shopRouter);
app.use('/api/inventory',        inventoryRouter);
app.use('/black-market',         blackMarketRouter);
app.use('/api/jobs',             jobsRouter);
app.use('/api/events',           eventRouter);
app.use('/api/social',           socialRouter);
app.use('/api',                  gangRouter);          // keeps /api/gangs*
app.use('/api/profile',          profileRouter);
app.use('/api/cars',             carRouter);

/* ─────────── Global error handler ─────────── */
app.use(errorHandler);

/* ─────────── Background jobs ─────────── */
startEnergyRegen();
startHealthRegen();
AchievementService.startAchievementChecker();
startBankInterest();

/* ─────────── Bootstrapping ─────────── */
import { initSocket } from './socket.js';
const PORT = process.env.API_PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('🗄️  Postgres connection: OK');

    await sequelize.sync({ alter: true });
    await ShopService.seedShopItems();     // ← seed weapons + armors once
    console.log('📦 Database synced ✅');

    const server = http.createServer(app);
    const io = initSocket(server);
    app.set('io', io);

    server.listen(PORT, () => {
      console.log(`✅ Server listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Server start error:', err);
  }
};

startServer();
