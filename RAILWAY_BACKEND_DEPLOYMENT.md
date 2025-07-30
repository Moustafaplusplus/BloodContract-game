# Railway Backend Deployment Guide

## 🚀 Deploying Backend to Railway

### **Step 1: Prepare Your Repository**

1. **Push your code to GitHub** (if not already done)
2. **Ensure all files are committed**:
   ```bash
   git add .
   git commit -m "Prepare for Railway deployment"
   git push origin main
   ```

### **Step 2: Deploy to Railway**

1. **Go to Railway Dashboard**
   - Visit [railway.app](https://railway.app)
   - Sign in to your account

2. **Create New Service**
   - Click "New Project" (if you don't have one)
   - Choose "Deploy from GitHub repo"
   - Select your BloodContract repository

3. **Add Backend Service**
   - Click "Add Service" → "GitHub Repo"
   - Select your repository
   - Set the **Root Directory** to `backend`
   - Click "Deploy"

### **Step 3: Configure Environment Variables**

In your Railway project dashboard, go to the backend service and add these environment variables:

#### **Required Variables:**
```env
DATABASE_URL=postgresql://postgres:gtTVrAOgkQCzXngovYGTnILpkakrjgbT@postgres.railway.internal:5432/railway
NODE_ENV=production
RAILWAY_ENVIRONMENT=true
JWT_SECRET=228a2fc779c4900389d73555571f3c3fcd6c675d066d0abc7fab09a839a7a16f0213c91fe2a740bc48c861584c7253
```

#### **Optional Variables:**
```env
API_PORT=5000
CORS_ORIGIN=https://your-frontend-domain.com
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
BANK_INTEREST_RATE=0.05
```

### **Step 4: Run Database Migrations**

After deployment, run migrations on Railway:

1. **Go to your backend service in Railway**
2. **Click on "Deployments" tab**
3. **Click on the latest deployment**
4. **Go to "Logs" tab**
5. **Run this command in the terminal**:
   ```bash
   npx sequelize-cli db:migrate --env production
   ```

### **Step 5: Verify Deployment**

1. **Check the deployment logs** for any errors
2. **Test the health endpoint**: `https://your-railway-app.railway.app/health`
3. **Test the performance endpoint**: `https://your-railway-app.railway.app/api/performance`

### **Step 6: Update Frontend Configuration**

Update your frontend to point to the Railway backend:

```javascript
// In your frontend configuration
const API_BASE_URL = 'https://your-railway-app.railway.app';
```

## 🎯 **Benefits of Railway Deployment**

### **Performance Improvements:**
- ✅ **Zero Latency**: Backend and database on same platform
- ✅ **Internal Network**: Uses Railway's internal network
- ✅ **Optimized Caching**: Better cache performance
- ✅ **Auto-scaling**: Railway handles traffic spikes

### **Reliability:**
- ✅ **Automatic Deployments**: Deploy on every git push
- ✅ **Health Checks**: Automatic restart on failures
- ✅ **SSL/TLS**: Automatic HTTPS certificates
- ✅ **Monitoring**: Built-in performance monitoring

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **Build Failures**
   - Check that `package.json` has correct scripts
   - Ensure all dependencies are in `dependencies` (not `devDependencies`)

2. **Database Connection Issues**
   - Verify `DATABASE_URL` is set correctly
   - Check that database service is running

3. **Environment Variables**
   - Double-check all variables are set
   - Ensure no typos in variable names

4. **Port Issues**
   - Railway automatically sets `PORT` environment variable
   - Use `process.env.PORT || 5000` in your code

### **Debugging Commands:**

```bash
# Check Railway logs
railway logs

# Check environment variables
railway variables

# Restart service
railway service restart
```

## 📊 **Performance Monitoring**

After deployment, monitor these endpoints:

- **Health Check**: `/health`
- **Performance**: `/api/performance`
- **Database Status**: Check Railway dashboard

## 🚀 **Next Steps**

1. **Deploy Frontend**: Consider deploying frontend to Railway or Vercel
2. **Set Up Custom Domain**: Configure custom domain in Railway
3. **Enable Monitoring**: Set up alerts and monitoring
4. **Optimize Further**: Add more caching and optimizations

---

**Your backend will be much faster once deployed to Railway! 🎉** 