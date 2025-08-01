# Firebase Auth Migration Setup Guide

This guide will help you set up Firebase Authentication to replace the current Passport.js-based authentication system.

## Prerequisites

1. A Firebase project (create one at https://console.firebase.google.com/)
2. Node.js and pnpm installed
3. Access to your database for migrations

## Step 1: Firebase Project Setup

### 1.1 Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name (e.g., "bloodcontract-game")
4. Follow the setup wizard

### 1.2 Enable Authentication
1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Enable the following providers:
   - **Email/Password** (for traditional signup/signin)
   - **Google** (for Google OAuth)
   - **Anonymous** (for guest users)

### 1.3 Configure Google OAuth
1. In Authentication > Sign-in method, click on "Google"
2. Enable it and add your authorized domains
3. Save the configuration

### 1.4 Configure Email/Password Authentication
1. In Authentication > Sign-in method, click on "Email/Password"
2. Enable it
3. Optionally enable "Email link (passwordless sign-in)" if desired
4. Save the configuration

### 1.5 Get Firebase Config
1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Add app" > "Web"
4. Register your app and copy the config

## Step 2: Frontend Configuration

### 2.1 Update Environment Variables
Copy `frontend/env.example` to `frontend/.env` and fill in your Firebase config:

```env
# API Configuration
VITE_API_URL=http://localhost:3000

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 2.2 Install Dependencies
```bash
cd frontend
pnpm install
```

## Step 3: Backend Configuration

### 3.1 Generate Firebase Admin SDK Key
1. In Firebase Console, go to Project Settings
2. Go to "Service accounts" tab
3. Click "Generate new private key"
4. Download the JSON file

### 3.2 Update Environment Variables
Copy `backend/env.example` to `backend/.env` and fill in your configuration:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=bloodcontract
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_jwt_secret_here

# Firebase Admin SDK Configuration
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your_service_account_email@your_project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your_service_account_email%40your_project.iam.gserviceaccount.com
FIREBASE_STORAGE_BUCKET=your_project.appspot.com

# Client URL
CLIENT_URL=http://localhost:5173
```

### 3.3 Run Database Migration
```bash
cd backend
pnpm run migrate
```

### 3.4 Install Dependencies
```bash
cd backend
pnpm install
```

## Step 4: Testing the Migration

### 4.1 Start the Backend
```bash
cd backend
pnpm dev
```

### 4.2 Start the Frontend
```bash
cd frontend
pnpm dev
```

### 4.3 Test Authentication Flow
1. Open the frontend in your browser
2. Try logging in with email/password
3. Try logging in with Google
4. Try creating a guest account
5. Verify that users are created in your database

## Step 5: Production Deployment

### 5.1 Update Production Environment Variables
Make sure to update your production environment variables with the correct Firebase configuration.

### 5.2 Deploy Backend
```bash
cd backend
pnpm run build
# Deploy to your hosting platform
```

### 5.3 Deploy Frontend
```bash
cd frontend
pnpm run build
# Deploy to your hosting platform
```

## Authentication Methods Supported

### Email/Password Authentication
- ✅ Traditional signup with username, email, age, gender
- ✅ Password confirmation
- ✅ Form validation
- ✅ Terms and conditions agreement
- ✅ Secure password handling through Firebase

### Google OAuth
- ✅ One-click Google sign-in
- ✅ Automatic profile creation
- ✅ Avatar import from Google

### Anonymous Authentication
- ✅ Guest user creation
- ✅ Temporary accounts
- ✅ Easy conversion to full accounts

## Migration Benefits

### Security Improvements
- **Better Token Management**: Firebase handles token refresh automatically
- **Built-in Security**: Firebase provides enterprise-grade security features
- **CSRF Protection**: Automatic protection against cross-site request forgery
- **Password Security**: Firebase handles password hashing and security

### User Experience
- **Faster Login**: No server-side OAuth redirects
- **Better Error Handling**: Firebase provides detailed error messages
- **Automatic Session Management**: Firebase handles session state
- **Multiple Auth Options**: Users can choose their preferred method

### Development Benefits
- **Less Code**: No need to manage OAuth flows manually
- **Better Scalability**: Firebase handles auth scaling automatically
- **Easier Maintenance**: Fewer custom authentication components
- **Unified Auth System**: All authentication methods work together

## Troubleshooting

### Common Issues

1. **Firebase Config Not Loading**
   - Check that all environment variables are set correctly
   - Verify the Firebase project ID matches

2. **Authentication Not Working**
   - Ensure all auth providers are enabled in Firebase Console
   - Check that authorized domains are configured
   - Verify Firebase Admin SDK configuration

3. **Database Migration Errors**
   - Make sure the database is accessible
   - Check that the migration file is in the correct location

4. **Token Verification Fails**
   - Verify Firebase Admin SDK configuration
   - Check that the service account has proper permissions

5. **Email/Password Auth Issues**
   - Ensure Email/Password provider is enabled in Firebase
   - Check that email verification is configured if needed

### Support
If you encounter issues, check:
1. Firebase Console logs
2. Browser developer console
3. Backend server logs
4. Database connection status

## Next Steps

After successful migration:
1. Remove old Passport.js code (optional)
2. Update any remaining auth-dependent components
3. Test all authentication flows thoroughly
4. Monitor performance and user experience
5. Consider adding more auth providers (Facebook, Apple, etc.) 