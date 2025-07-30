# Railway Database Migration Guide

## Step 1: Railway Environment Variables

After creating your PostgreSQL database on Railway, you'll get connection details. Update your environment variables:

```env
# Railway PostgreSQL Database
DB_HOST=your-railway-postgres-host.railway.app
DB_PORT=5432
DB_NAME=railway
DB_USER=postgres
DB_PASS=your-railway-postgres-password
DATABASE_URL=postgresql://postgres:your-railway-postgres-password@your-railway-postgres-host.railway.app:5432/railway
```

## Step 2: Update Database Configuration

Railway provides a `DATABASE_URL` environment variable. Update your database configuration to use it:

### Update backend/src/config/db.js:

```javascript
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const dbConfig = {
  url: process.env.DATABASE_URL,
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    connectTimeout: 30000,
    acquireTimeout: 30000,
    timeout: 30000,
    statement_timeout: 15000,
    idle_in_transaction_session_timeout: 15000,
  },
  pool: {
    max: 10,
    min: 2,
    acquire: 30000,
    idle: 5000,
    evict: 15000,
  },
  retry: {
    max: 3,
    timeout: 10000,
  },
};

const sequelize = new Sequelize(process.env.DATABASE_URL, dbConfig);

// ... rest of the file remains the same
```

### Update backend/sequelize.config.cjs:

```javascript
require('dotenv').config();

module.exports = {
  development: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    },
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
  },
};
```

## Step 3: Run Migrations

1. Install Railway CLI (optional but recommended):
   ```bash
   npm install -g @railway/cli
   ```

2. Run migrations on Railway:
   ```bash
   cd backend
   npx sequelize-cli db:migrate --env production
   ```

## Step 4: Seed Data (Optional)

If you want to seed your Railway database with initial data:
```bash
cd backend
node src/resetAndSeed.js
```

## Step 5: Deploy Your Application

1. Connect your GitHub repository to Railway
2. Add your backend as a service
3. Set the environment variables in Railway dashboard
4. Deploy!

## Environment Variables to Set in Railway Dashboard:

- `DATABASE_URL` (automatically provided by Railway)
- `DB_HOST` (from Railway PostgreSQL service)
- `DB_PORT` (5432)
- `DB_NAME` (railway)
- `DB_USER` (postgres)
- `DB_PASS` (from Railway PostgreSQL service)
- `JWT_SECRET` (your JWT secret)
- `GOOGLE_CLIENT_ID` (your Google OAuth client ID)
- `GOOGLE_CLIENT_SECRET` (your Google OAuth client secret)
- `NODE_ENV` (production)

## Troubleshooting:

1. **SSL Issues**: Railway requires SSL connections in production
2. **Connection Pool**: Railway has connection limits, so we've reduced pool size
3. **Migration Issues**: Make sure all migration files are in the correct format
4. **Environment Variables**: Double-check all variables are set in Railway dashboard 