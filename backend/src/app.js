import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import { sequelize } from './config/db.js';

// Register models to ensure Sequelize links them
import './models/user.js';
import './models/character.js';
import './models/crime.js';

// Routes
import crimeRoutes from './routes/crimes.js';
import authRoutes from './routes/auth.js';

dotenv.config({ path: '../.env' }); // optional fallback

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/', (_req, res) => res.send('🎉 Backend is working!'));

// API routes
app.use('/api/crimes', crimeRoutes);
app.use('/api/auth', authRoutes); // ✅ New route for login/register

// ---------- Boot strap ----------
const PORT = process.env.API_PORT || 5000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('🗄️  Postgres connection: OK');

    await sequelize.sync(); // Create tables if they don’t exist
    app.listen(PORT, () =>
      console.log(`✅ Server listening on http://localhost:${PORT}`),
    );
  } catch (err) {
    console.error('❌ Unable to connect to DB:', err);
  }
})();
