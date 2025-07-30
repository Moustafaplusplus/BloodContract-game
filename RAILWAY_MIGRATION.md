# Railway Database Migration Guide

This guide will help you migrate your BloodContract database to Railway.

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Node.js**: Make sure you have Node.js installed locally

## Step 1: Create Railway Project

1. Go to [Railway.app](https://railway.app) and sign in
2. Click "New Project"
3. Choose "Deploy from GitHub repo"
4. Select your BloodContract repository
5. Add a PostgreSQL database service to your project

## Step 2: Configure Environment Variables

In your Railway project dashboard, go to the "Variables" tab and add these environment variables:

### Required Variables:
```env
DATABASE_URL=postgresql://postgres:password@host.railway.app:5432/railway
NODE_ENV=production
JWT_SECRET=your-jwt-secret-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Optional Variables:
```env
API_PORT=5000
CORS_ORIGIN=https://your-frontend-domain.com
```

**Note**: Railway automatically provides the `DATABASE_URL` when you add a PostgreSQL service.

## Step 3: Update Your Local Configuration

### 1. Update Database Configuration

The database configuration has been updated to work with Railway. The main changes are:

- Using `DATABASE_URL` instead of individual connection parameters
- SSL configuration for production
- Optimized connection pooling

### 2. Test Local Connection

You can test your Railway database connection locally:

```bash
cd backend
node migrate-to-railway.js
```

## Step 4: Deploy to Railway

### Option 1: Automatic Deployment (Recommended)

1. Push your code to GitHub
2. Railway will automatically deploy when it detects changes
3. Check the deployment logs in Railway dashboard

### Option 2: Manual Deployment

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Link your project:
   ```bash
   railway link
   ```

4. Deploy:
   ```bash
   railway up
   ```

## Step 5: Run Database Migrations

After deployment, run migrations on Railway:

```bash
cd backend
npx sequelize-cli db:migrate --env production
```

Or use the provided migration script:

```bash
cd backend
node migrate-to-railway.js
```

## Step 6: Seed Database (Optional)

If you want to populate your Railway database with initial data:

```bash
cd backend
node src/resetAndSeed.js
```

## Step 7: Update Frontend Configuration

Update your frontend to point to your Railway backend URL:

```javascript
// In your frontend configuration
const API_BASE_URL = 'https://your-railway-app.railway.app';
```

## Troubleshooting

### Common Issues:

1. **SSL Connection Errors**
   - Make sure `NODE_ENV=production` is set
   - SSL is required for Railway PostgreSQL

2. **Migration Failures**
   - Check that all migration files are in the correct format
   - Ensure `DATABASE_URL` is properly set

3. **Connection Timeouts**
   - Railway has connection limits, so we've optimized the pool settings
   - Check the connection pool configuration in `backend/src/config/db.js`

4. **Environment Variables**
   - Double-check all variables are set in Railway dashboard
   - Make sure there are no typos in variable names

### Debugging:

1. **Check Railway Logs**
   - Go to your Railway project dashboard
   - Click on your service
   - Check the "Logs" tab for error messages

2. **Test Database Connection**
   ```bash
   cd backend
   node -e "
   import { Sequelize } from 'sequelize';
   const sequelize = new Sequelize(process.env.DATABASE_URL, {
     dialect: 'postgres',
     dialectOptions: { ssl: { rejectUnauthorized: false } }
   });
   sequelize.authenticate().then(() => console.log('Connected!')).catch(console.error);
   "
   ```

## Files Modified for Railway Migration

1. `backend/src/config/db.js` - Updated to use `DATABASE_URL`
2. `backend/sequelize.config.cjs` - Added production environment
3. `backend/src/app.js` - Added health check endpoint
4. `railway.json` - Railway configuration
5. `backend/migrate-to-railway.js` - Migration script
6. `backend/railway-deploy.sh` - Deployment script

## Next Steps

1. **Monitor Your Application**: Use Railway's dashboard to monitor performance
2. **Set Up Custom Domain**: Configure a custom domain in Railway
3. **Set Up Monitoring**: Consider adding monitoring tools
4. **Backup Strategy**: Set up regular database backups

## Support

If you encounter issues:

1. Check Railway's [documentation](https://docs.railway.app)
2. Review the deployment logs in Railway dashboard
3. Test locally with the provided migration script
4. Check that all environment variables are correctly set

---

**Happy deploying! 🚀** 