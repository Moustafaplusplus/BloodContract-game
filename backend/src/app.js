import express from 'express';
import cors    from 'cors';
import morgan  from 'morgan';
import dotenv  from 'dotenv';
import { sequelize } from './config/db.js';
import { Crime }     from './models/crime.js';     // ensure model registers
import crimeRoutes   from './routes/crimes.js';

dotenv.config({ path: '../.env' });                // fallback if needed

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// health-check
app.get('/', (_req, res) => res.send('🎉 Backend is working!'));

// REST routes
app.use('/api/crimes', crimeRoutes);

// ---------- boot strap ----------
const PORT = process.env.API_PORT || 5000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('🗄️  Postgres connection: OK');

    await sequelize.sync();         // creates tables if they don’t exist
    app.listen(PORT, () =>
      console.log(`✅ Server listening on http://localhost:${PORT}`),
    );
  } catch (err) {
    console.error('❌ Unable to connect to DB:', err);
  }
})();
