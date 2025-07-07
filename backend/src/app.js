// ============================
//  backend/src/app.js – unified DB + Socket.IO bootstrap (feature barrels)
// ============================

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
import { User, router as userRouter }                      from './features/user.js';
import { crimeRouter, Crime, CrimeLog }                    from './features/crimes.js';
import { characterRouter, Character as CharacterModel, startEnergyRegen, startHealthRegen } from './features/character.js';
import { fightRouter, Fight as FightModel }                from './features/fights.js';
import { bankRouter, BankAccount, startBankInterest }      from './features/bank.js';
import { jailRouter, hospitalRouter, Jail as JailModel, Hospital as HospitalModel } from './features/confinement.js';
import { achievementRouter, leaderboardRouter, Achievement as AchievementModel, CharacterAchievement as CharacterAchievementModel, startAchievementChecker as startAchCron } from './features/achievements.js';
import { router as goldMarketRouter }                      from './features/gold.js';
import { router as housesRouter, House as HouseModel, UserHouse as UserHouseModel } from './features/houses.js';
import { router as shopRouter, Weapon, Armor }             from './features/shop.js';
import { router as inventoryRouter, InventoryItem }        from './features/inventory.js';
import { router as blackMarketRouter }                     from './features/blackMarket.js';
import { jobsRouter, gymRouter, startJobPayoutCron }       from './features/jobs.js';
import { friendsRouter, messengerRouter }                  from './features/social.js';
import { gangRouter }                                      from './features/gang.js';
import { eventRouter, Event as EventModel }                from './features/events.js';
import { profileRouter, searchRouter, errorHandler }       from './features/profile.js';
import { carRouter, Car as CarModel }                      from './features/car.js';

/* ─────────── Sequelize model auto-init (skip if already inited) ─────────── */
[
  User, CharacterModel, AchievementModel, CharacterAchievementModel,
  JailModel, HospitalModel, Crime, CrimeLog,
  Weapon, Armor, InventoryItem,
  HouseModel, UserHouseModel,
  FightModel, BankAccount,
  EventModel, CarModel,
].forEach((M) => {
  if (M.sequelize || typeof M.init !== 'function') return; // already initialised
  M.init.length === 1 ? M.init(sequelize) : M.init(sequelize, DataTypes);
});

/* ─────────── Express bootstrapping ─────────── */
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));
app.get('/', (_req, res) => res.send('🎉 Backend is working!'));

/* ─────────── Feature-barrel routers ─────────── */
app.use('/api',                  userRouter);          // /api/signup, /api/login …
app.use('/api/crimes',           crimeRouter);
app.use('/api/character',        characterRouter);
app.use('/api/fight',            fightRouter);
app.use('/api/bank',             bankRouter);
app.use('/api/jail',             jailRouter);
app.use('/api/hospital',         hospitalRouter);
app.use('/api/achievements',     achievementRouter);
app.use('/api/leaderboard',      leaderboardRouter);
app.use('/gold-market',          goldMarketRouter);
app.use('/api/houses',           housesRouter);
app.use('/api/shop',             shopRouter);
app.use('/api/inventory',        inventoryRouter);
app.use('/black-market',         blackMarketRouter);
app.use('/api/jobs',             jobsRouter);
app.use('/api/gym',              gymRouter);
app.use('/api/events',           eventRouter);
app.use('/api/friends',          friendsRouter);
app.use('/api/v1/messenger',     messengerRouter);
app.use('/api',                  gangRouter);          // keeps /api/gangs*
app.use('/api/profile',          profileRouter);
app.use('/api/v1/search',        searchRouter);
app.use('/api/car-shop',         carRouter);

/* ─────────── Global error handler ─────────── */
app.use(errorHandler);

/* ─────────── Background jobs ─────────── */
startEnergyRegen();
startHealthRegen();
startAchCron();
startBankInterest();
startJobPayoutCron();

/* ─────────── Bootstrapping ─────────── */
import { initSocket } from './socket.js';
const PORT = process.env.API_PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('🗄️  Postgres connection: OK');

    await sequelize.sync({ alter: true });
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