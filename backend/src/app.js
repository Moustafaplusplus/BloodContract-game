// src/app.js
import express from 'express';
import cors    from 'cors';
import morgan  from 'morgan';
import dotenv  from 'dotenv';
import http    from 'http';

import { sequelize } from './config/db.js';

// ────── Load Sequelize models ──────
import './models/user.js';
import './models/character.js';
import './models/crime.js';
import './models/weapon.js';
import './models/house.js';
import './models/fight.js';
import './models/event.js';
import './models/job.js';
import './models/crimeLog.js';
import './models/hospital.js';
import './models/jail.js';
 import './models/armor.js';
 import './models/inventoryItem.js';

// ────── API routes ──────
import crimeRoutes     from './routes/crimes.js';
import authRoutes      from './routes/auth.js';
import characterRoutes from './routes/character.js';
import shopRoutes from './routes/shop.js';
import houseRoutes     from './routes/houses.js';
import fightRoutes     from './routes/fight.js';
import userRoutes      from './routes/users.js';
import jobRoutes       from './routes/jobs.js';
import eventsRoutes    from './routes/events.js';
import gymRoutes    from './routes/gym.js';
import bankRoutes   from './routes/bank.js';
import jailRoutes from './routes/jail.js';
import hospitalRoutes from './routes/hospital.js';
import inventoryRoutes from './routes/inventory.js';
import  blackMarketRouter  from './routes/blackMarket.js';
import  goldMarketRouter   from './routes/goldMarket.js';
import gangRoutes from './routes/gang.js';

// ────── WebSocket mount ──────
import { mountWebSocket } from './ws.js';

// ────── Env & App setup ──────
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/', (_req, res) => res.send('🎉 Backend is working!'));

// ────── REST endpoints ──────
app.use('/api/crimes',    crimeRoutes);
app.use('/api/auth',      authRoutes);
app.use('/api/character', characterRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/houses',    houseRoutes);
app.use('/api/fight',     fightRoutes);
app.use('/api/users',     userRoutes);
app.use('/api/jobs',      jobRoutes);
app.use('/api/events',    eventsRoutes);
app.use('/api/gym',    gymRoutes);
app.use('/api/bank',   bankRoutes);
app.use('/api/jail', jailRoutes);
app.use('/api/hospital', hospitalRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/black-market', blackMarketRouter);
app.use('/gold-market',  goldMarketRouter);
app.use('/api', gangRoutes);



// ────── Background cron job ──────
import './jobs/staminaRegen.js';
import './jobs/bankInterest.js'; 

// ────── Bootstrapping ──────
const PORT = process.env.API_PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('🗄️  Postgres connection: OK');

    await sequelize.sync({ alter: true });
    console.log('📦 Database synced ✅');

    // Create HTTP server & attach WebSockets
    const server = http.createServer(app);
    mountWebSocket(server);

    server.listen(PORT, () =>
      console.log(`✅ Server listening on http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error('❌ Database sync error:', err);
  }
};

startServer();
