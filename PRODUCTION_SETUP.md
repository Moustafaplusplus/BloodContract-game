# Production Setup Guide

## Overview
This guide explains how to properly configure the Blood Contract game for production using Railway (backend) and Firebase (image storage).

## Environment Variables

### Frontend Environment Variables
Create a `.env` file in the `frontend` directory:

```env
# API Configuration
VITE_API_URL=https://your-railway-app.railway.app

# Firebase Configuration (if needed for frontend)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
```

### Backend Environment Variables (Railway)
Set these in your Railway project dashboard:

```env
# Database
DATABASE_URL=your_database_url

# JWT Secret
JWT_SECRET=your_jwt_secret

# Firebase Admin SDK
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your_project.iam.gserviceaccount.com
FIREBASE_STORAGE_BUCKET=your_project.appspot.com

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Session Secret
SESSION_SECRET=your_session_secret
```

## API Configuration

### Frontend API Calls
The frontend is configured to work in two modes:

1. **Development Mode**: Uses Vite proxy to forward API calls to the backend
2. **Production Mode**: Uses `VITE_API_URL` environment variable

### Backend API Endpoints
All API endpoints are prefixed with `/api`:

- `GET /api/profile` - Get own profile
- `PUT /api/profile` - Update profile (quote, bio)
- `POST /api/avatar` - Upload avatar image
- `GET /api/character` - Get character data
- `GET /api/confinement/hospital` - Get hospital status

## Image Storage (Firebase)

### Avatar Upload Flow
1. Frontend sends image file to `/api/avatar`
2. Backend uploads to Firebase Storage
3. Backend updates `User.avatarUrl` field
4. Frontend receives the new avatar URL

### Firebase Storage Structure
```
bloodcontract/
├── avatars/
│   ├── user_1_1234567890.jpg
│   ├── user_2_1234567890.png
│   └── ...
├── crimes/
├── weapons/
├── armors/
└── ...
```

## Profile Update Issues Fixed

### 1. Field Name Mismatch
**Issue**: ProfileService was looking for `'avatar'` field in Character model
**Fix**: Updated to use `'avatarUrl'` field in User model

### 2. Query Invalidation
**Issue**: Frontend was invalidating wrong query key
**Fix**: Updated to use `["character", userId]` consistently

### 3. Error Handling
**Issue**: Generic error messages
**Fix**: Enhanced error handling with specific error messages

### 4. API Configuration
**Issue**: Conflicts between proxy and axios baseURL
**Fix**: Conditional axios baseURL setting based on environment

## Testing Production Setup

### 1. Health Check
```bash
curl https://your-railway-app.railway.app/health
```

### 2. Profile Endpoint Test
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     https://your-railway-app.railway.app/api/profile
```

### 3. Avatar Upload Test
```bash
curl -X POST \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -F "avatar=@test-image.jpg" \
     https://your-railway-app.railway.app/api/avatar
```

## Deployment Checklist

### Frontend
- [ ] Set `VITE_API_URL` environment variable
- [ ] Build for production: `pnpm build`
- [ ] Deploy to your hosting platform

### Backend (Railway)
- [ ] Set all environment variables in Railway dashboard
- [ ] Ensure Firebase service account is properly configured
- [ ] Verify database connection
- [ ] Test health endpoint

### Firebase
- [ ] Create Firebase project
- [ ] Enable Storage API
- [ ] Create service account and download JSON
- [ ] Set up CORS rules for Storage bucket
- [ ] Configure public read access for images

## Common Issues and Solutions

### 1. CORS Errors
**Solution**: Ensure Railway domain is allowed in Firebase CORS settings

### 2. Authentication Errors
**Solution**: Verify JWT_SECRET is set correctly in Railway

### 3. Image Upload Failures
**Solution**: Check Firebase service account permissions and Storage bucket configuration

### 4. Database Connection Issues
**Solution**: Verify DATABASE_URL is correct and database is accessible

## Monitoring

### Railway Logs
Monitor your Railway app logs for any errors:
```bash
railway logs
```

### Firebase Storage
Monitor Firebase Storage usage and costs in the Firebase console.

### Health Checks
The backend provides a health endpoint at `/health` for monitoring.

## Security Considerations

1. **JWT Tokens**: Keep JWT_SECRET secure and rotate regularly
2. **Firebase**: Use service account with minimal required permissions
3. **CORS**: Configure CORS properly for your domains
4. **Rate Limiting**: Consider implementing rate limiting for API endpoints
5. **File Upload**: Validate file types and sizes on both frontend and backend 