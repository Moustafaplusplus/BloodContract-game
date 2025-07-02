// src/app.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import { sequelize } from './config/db.js';

// Register models
import './models/user.js';
import './models/character.js';
import './models/crime.js';
import './models/weapon.js';
import './models/house.js';

// Routes
import crimeRoutes from './routes/crimes.js';
import authRoutes from './routes/auth.js';
import characterRoutes from './routes/character.js';
import weaponRoutes from './routes/weapons.js';
import houseRoutes from './routes/houses.js';

// Load environment variables from .env file
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/', (_req, res) => res.send('🎉 Backend is working!'));

// API routes
app.use('/api/crimes', crimeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/character', characterRoutes);
app.use('/api/weapons', weaponRoutes);
app.use('/api/houses', houseRoutes);

// Start stamina regen job in background
import './jobs/staminaRegen.js'; // ✅ starts auto loop

// ---------- Bootstrapping ----------
const PORT = process.env.API_PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('🗄️  Postgres connection: OK');

    await sequelize.sync({ alter: true });
    console.log('📦 Database synced ✅');

    app.listen(PORT, () =>
      console.log(`✅ Server listening on http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error('❌ Database sync error:', err);
  }
};

startServer();
