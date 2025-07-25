# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for the BloodContract application.

## Prerequisites

1. A Google account
2. Access to Google Cloud Console

## Step 1: Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application" as the application type
   - Add authorized redirect URIs:
     - `http://localhost:5000/api/auth/google/callback` (for development)
     - `https://yourdomain.com/api/auth/google/callback` (for production)
   - Copy the Client ID and Client Secret

## Step 2: Environment Variables

Add the following environment variables to your `.env` file in the backend directory:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Session Configuration
SESSION_SECRET=your_session_secret_key_here

# Other required variables
JWT_SECRET=your_jwt_secret_key_here
CLIENT_URL=http://localhost:5173
```

## Step 3: Database Migration

Run the migration to add the Google ID field to the Users table:

```bash
cd backend
npx sequelize-cli db:migrate
```

## Step 4: Install Dependencies

The required packages have already been installed:

### Backend
- `passport`
- `passport-google-oauth20`
- `express-session`

### Frontend
- `@google-cloud/local-auth`
- `googleapis`

## Step 5: Test the Integration

1. Start the backend server:
   ```bash
   cd backend
   pnpm dev
   ```

2. Start the frontend development server:
   ```bash
   cd frontend
   pnpm dev
   ```

3. Navigate to the login or signup page
4. Click the "تسجيل الدخول بحساب جوجل" (Sign in with Google) button
5. Complete the Google OAuth flow

## Features

- **Automatic Account Creation**: New users are automatically created when they sign in with Google
- **Account Linking**: Existing users can link their accounts to Google
- **Profile Sync**: Google profile information (name, email, avatar) is synced to the user account
- **JWT Token**: Users receive a JWT token for subsequent API calls
- **Seamless Integration**: Works alongside existing email/password authentication

## Security Considerations

1. **HTTPS in Production**: Always use HTTPS in production for secure OAuth communication
2. **Environment Variables**: Never commit sensitive credentials to version control
3. **Session Security**: Use strong session secrets and secure cookies in production
4. **Token Expiration**: JWT tokens expire after 7 days for security

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI" error**:
   - Ensure the redirect URI in Google Cloud Console matches exactly
   - Check for trailing slashes or protocol mismatches

2. **"Client ID not found" error**:
   - Verify the GOOGLE_CLIENT_ID environment variable is set correctly
   - Check that the OAuth credentials are properly configured

3. **Database errors**:
   - Ensure the migration has been run successfully
   - Check database connection and permissions

4. **CORS errors**:
   - Verify CLIENT_URL environment variable is set correctly
   - Check that the frontend URL matches the CORS configuration

### Debug Mode

To enable debug logging, add this to your backend `.env` file:

```env
DEBUG=passport:*
```

This will show detailed OAuth flow information in the console. 