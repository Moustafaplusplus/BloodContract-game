# Deployment Troubleshooting Guide

## Issue Summary
The backend deployment is failing health checks on Railway. The build succeeds but the service becomes unavailable during health checks.

## Root Cause Analysis
The main issues are likely:
1. **Database Connection Issues**: The server might be failing to connect to the database
2. **Environment Variables**: Missing or incorrect environment variables
3. **Startup Timing**: The server might not be ready when health checks start
4. **Module Import Issues**: ES module imports might be failing

## Changes Made

### 1. Improved Server Startup (`src/app.js`)
- Moved `dotenv.config()` to the top to ensure environment variables are loaded first
- Added better error handling and logging
- Added debug endpoints (`/api/debug/env`, `/api/debug/firebase`)
- Improved database connection retry logic
- Added graceful shutdown handling

### 2. Enhanced Health Check (`health-check.js`)
- Added multiple fallback endpoints (`/health-simple`, `/`, `/health`)
- Increased timeout to 15 seconds
- Added better error reporting and debugging information
- Progressive health check testing

### 3. Debug Startup Script (`start-debug.js`)
- Created a dedicated debug startup script for Railway
- Added environment variable logging
- Better process management and error handling

### 4. Railway Configuration (`railway.json`)
- Updated to use the debug startup script
- Increased health check timeout to 300 seconds
- Added restart policy configuration

### 5. Test Scripts
- Added `test-startup.js` for local testing
- Added `verify-deployment.js` for deployment verification
- Added new npm scripts for testing

## Troubleshooting Steps

### 1. Local Testing
```bash
# Test the server startup locally
npm run test:startup

# Test deployment verification
npm run verify

# Run in debug mode
npm run debug
```

### 2. Check Environment Variables
The server now provides debug endpoints to check environment variables:
- `/api/debug/env` - Check basic environment variables
- `/api/debug/firebase` - Check Firebase configuration

### 3. Railway Deployment
1. Ensure all required environment variables are set in Railway:
   - `DATABASE_URL`
   - `NODE_ENV=production`
   - `PORT` (Railway sets this automatically)
   - Firebase variables (if using Firebase)

2. Check Railway logs for:
   - Database connection errors
   - Module import errors
   - Environment variable issues

### 4. Health Check Debugging
The health check script now tests multiple endpoints:
1. `/health-simple` - Basic server check (no database)
2. `/health` - Full health check with database
3. `/` - Root endpoint as fallback

### 5. Database Connection Issues
If database connection is failing:
1. Check `DATABASE_URL` in Railway environment variables
2. Verify the database is accessible from Railway
3. Check if SSL is required and properly configured

### 6. Common Issues and Solutions

#### Issue: "Module not found" errors
**Solution**: Ensure all imports use `.js` extension for ES modules

#### Issue: Database connection timeout
**Solution**: 
- Check `DATABASE_URL` format
- Verify database is accessible
- Check SSL configuration

#### Issue: Health check fails immediately
**Solution**:
- Check if server is starting properly
- Verify port configuration
- Check for startup errors in logs

#### Issue: Health check times out
**Solution**:
- Increase health check timeout in Railway
- Check if server is taking too long to start
- Verify database connection isn't blocking startup

## Monitoring and Debugging

### Railway Logs
Check Railway logs for:
- Startup messages
- Database connection status
- Error messages
- Health check attempts

### Debug Endpoints
Use these endpoints to debug issues:
- `GET /` - Basic server status
- `GET /health-simple` - Server health (no database)
- `GET /health` - Full health check
- `GET /api/debug/env` - Environment variables
- `GET /api/debug/firebase` - Firebase configuration

### Local Testing Commands
```bash
# Test startup
npm run test:startup

# Run in debug mode
npm run debug

# Verify deployment
npm run verify

# Health check
node health-check.js
```

## Expected Behavior

### Successful Deployment
1. Build completes successfully
2. Server starts within 30 seconds
3. Health checks pass within 5 minutes
4. All endpoints respond correctly

### Failed Deployment Indicators
1. Build succeeds but health checks fail
2. Server doesn't start or crashes
3. Database connection errors
4. Module import errors

## Next Steps

If the deployment still fails:

1. **Check Railway Logs**: Look for specific error messages
2. **Test Locally**: Use `npm run test:startup` to test locally
3. **Verify Environment**: Use debug endpoints to check configuration
4. **Database Issues**: Verify database connection and credentials
5. **Module Issues**: Check for ES module import problems

## Contact Information
If issues persist, check:
- Railway deployment logs
- Database connection status
- Environment variable configuration
- Node.js version compatibility 