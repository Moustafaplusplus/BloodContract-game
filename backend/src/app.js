// ============================
// backend/src/app.js – unified DB + Socket.IO bootstrap
// ============================

import express  from 'express';
import cors     from 'cors';
import morgan   from 'morgan';
import dotenv   from 'dotenv';
import http     from 'http';

import { DataTypes } from 'sequelize';
import { sequelize } from './config/db.js';

// ─────────── DB & Models bootstrap ───────────
export { sequelize };                 // reuse in tests if needed

import Jail                 from './models/jail.js';
import Hospital             from './models/hospital.js';
import Crime                from './models/crime.js';
import CrimeLog             from './models/crimeLog.js';
import User                 from './models/user.js';
import Character            from './models/character.js';
import Weapon               from './models/weapon.js';
import { House, UserHouse } from './models/house.js';
import Fight                from './models/fight.js';
import Event                from './models/event.js';
import Job                  from './models/job.js';
import Armor                from './models/armor.js';
import InventoryItem        from './models/inventoryItem.js';
import Achievement          from './models/achievement.js';
import CharacterAchievement from './models/characterAchievement.js';

// auto-init any class-style models that haven’t self-registered
[
  User, Character, Achievement, CharacterAchievement,
  Jail, Hospital, Crime, CrimeLog, Weapon,
  House, UserHouse, Fight, Event, Job, Armor, InventoryItem,
].forEach((M) => {
  if (M.sequelize || typeof M.init !== 'function') return;
  M.init.length === 1 ? M.init(sequelize) : M.init(sequelize, DataTypes);
});

// ─────────── Env & Express setup ───────────
dotenv.config();
const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// ─────────── Routes ───────────
import crimeRoutes       from './routes/crimes.js';
import authRoutes        from './routes/auth.js';
import characterRoutes   from './routes/character.js';
import shopRoutes        from './routes/shop.js';
import houseRoutes       from './routes/houses.js';
import fightRoutes       from './routes/fight.js';
import userRoutes        from './routes/users.js';
import jobRoutes         from './routes/jobs.js';
import eventsRoutes      from './routes/events.js';
import gymRoutes         from './routes/gym.js';
import bankRoutes        from './routes/bank.js';
import jailRoutes        from './routes/jail.js';
import hospitalRoutes    from './routes/hospital.js';
import inventoryRoutes   from './routes/inventory.js';
import blackMarketRouter from './routes/blackMarket.js';
import goldMarketRouter  from './routes/goldMarket.js';
import gangRoutes        from './routes/gang.js';
import messengerRouter   from './routes/messenger.js';
import searchRouter      from './routes/search.js';
import leaderboardRoutes from './routes/leaderboard.js';
import friendsRouter from './routes/friends.js';
import profileRouter from './routes/profile.js';


app.get('/', (_req, res) => res.send('🎉 Backend is working!'));

app.use('/api/crimes',       crimeRoutes);
app.use('/api/auth',         authRoutes);
app.use('/api/character',    characterRoutes);
app.use('/api/shop',         shopRoutes);
app.use('/api/houses',       houseRoutes);
app.use('/api/fight',        fightRoutes);
app.use('/api/users',        userRoutes);
app.use('/api/jobs',         jobRoutes);
app.use('/api/events',       eventsRoutes);
app.use('/api/gym',          gymRoutes);
app.use('/api/bank',         bankRoutes);
app.use('/api/jail',         jailRoutes);
app.use('/api/hospital',     hospitalRoutes);
app.use('/api/inventory',    inventoryRoutes);
app.use('/black-market',     blackMarketRouter);
app.use('/gold-market',      goldMarketRouter);
app.use('/api',              gangRoutes);
app.use('/api/v1/messenger', messengerRouter);
app.use('/api/v1/search',    searchRouter);
app.use('/api/leaderboard',  leaderboardRoutes);
app.use('/api/friends', friendsRouter);
app.use('/api/profile', profileRouter);


import errorHandler from './middlewares/errorHandler.js';
app.use(errorHandler);

// ─────────── Background jobs ───────────
import { startAchievementChecker } from './jobs/achievementChecker.js';
import { startEnergyRegen }        from './jobs/energyRegen.js';
import { startHealthRegen }        from './jobs/healthRegen.js';
import './jobs/bankInterest.js';

startEnergyRegen();
startHealthRegen();
startAchievementChecker();

// ─────────── Bootstrapping ───────────
import { initSocket } from './socket.js';      // ← your new socket file

const PORT = process.env.API_PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('🗄️  Postgres connection: OK');

    await sequelize.sync({ alter: true });
    console.log('📦 Database synced ✅');

    const server = http.createServer(app);
    const io = initSocket(server);             // attach Socket.IO
    app.set('io', io);                         // share via req.app.get('io')

    server.listen(PORT, () => {
      console.log(`✅ Server listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Server start error:', err);
  }
};

startServer();
