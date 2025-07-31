# Google OAuth Setup Guide for BloodContract

This guide will help you set up Google OAuth authentication for your BloodContract application.

## Prerequisites

- Google account
- Access to Google Cloud Console
- Your application deployed or running locally

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter a project name (e.g., "BloodContract Game")
5. Click "Create"

## Step 2: Enable Google+ API

1. In your new project, go to "APIs & Services" > "Library"
2. Search for "Google+ API" or "Google Identity"
3. Click on "Google+ API" and click "Enable"
4. Also enable "Google Identity and Access Management (IAM) API"

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen first:
   - User Type: External
   - App name: "BloodContract Game"
   - User support email: Your email
   - Developer contact information: Your email
   - Save and continue through the steps

4. Back to creating OAuth client ID:
   - Application type: "Web application"
   - Name: "BloodContract Web Client"
   - Authorized JavaScript origins:
     ```
     http://localhost:5173
     http://localhost:3000
     https://your-production-domain.com
     ```
   - Authorized redirect URIs:
     ```
     http://localhost:3000/api/auth/google/callback
     https://your-production-domain.com/api/auth/google/callback
     ```

5. Click "Create"
6. **Save the Client ID and Client Secret** - you'll need these for environment variables

## Step 4: Configure Environment Variables

### For Development (Local)

Create a `.env` file in your backend directory:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here

# Other required variables
JWT_SECRET=your_jwt_secret_here
CLIENT_URL=http://localhost:5173
```

### For Production (Railway/Heroku/etc.)

Set these environment variables in your hosting platform:

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
CLIENT_URL=https://your-frontend-domain.com
JWT_SECRET=your_jwt_secret_here
```

## Step 5: Update Your Application URLs

### Development URLs
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- Callback: `http://localhost:3000/api/auth/google/callback`

### Production URLs
- Frontend: `https://your-frontend-domain.com`
- Backend: `https://your-backend-domain.com`
- Callback: `https://your-backend-domain.com/api/auth/google/callback`

## Step 6: Test the Setup

1. Start your backend server:
   ```bash
   cd backend
   pnpm dev
   ```

2. Start your frontend:
   ```bash
   cd frontend
   pnpm dev
   ```

3. Go to your login page and click "تسجيل الدخول بحساب جوجل"
4. You should be redirected to Google's OAuth consent screen
5. After authorization, you should be redirected back to your app

## Troubleshooting

### Common Issues

1. **"Google OAuth is not configured"**
   - Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
   - Restart your server after setting environment variables

2. **"redirect_uri_mismatch"**
   - Ensure the redirect URI in Google Cloud Console matches exactly
   - Check for trailing slashes or protocol mismatches

3. **"invalid_client"**
   - Verify your Client ID and Client Secret are correct
   - Make sure you're using the right credentials for your environment

4. **CORS Issues**
   - Ensure your frontend domain is in the authorized origins
   - Check that your backend CORS settings include your frontend domain

### Debug Logs

The application now includes detailed logging. Check your backend console for:
- ✅ Google OAuth configured successfully
- 🔐 Initiating Google OAuth flow
- 🔄 Processing Google OAuth callback
- ✅ Google OAuth successful

## Security Best Practices

1. **Never commit credentials to version control**
2. **Use different OAuth clients for development and production**
3. **Regularly rotate your Client Secret**
4. **Monitor OAuth usage in Google Cloud Console**
5. **Set up proper CORS policies**

## Production Deployment Checklist

- [ ] Create production OAuth credentials
- [ ] Set environment variables in production
- [ ] Update authorized origins and redirect URIs
- [ ] Test the complete OAuth flow
- [ ] Monitor logs for any issues
- [ ] Set up proper SSL certificates

## Additional Configuration

### Custom Scopes
If you need additional user information, you can modify the scope in `passport.js`:

```javascript
scope: ['profile', 'email', 'openid']
```

### User Profile Enhancement
You can enhance the user creation process by adding more fields from the Google profile:

```javascript
user = await User.create({
  username: finalUsername,
  email: profile.emails[0].value,
  googleId: profile.id,
  firstName: profile.name?.givenName,
  lastName: profile.name?.familyName,
  avatarUrl: profile.photos[0]?.value,
  // ... other fields
});
```

## Support

If you encounter issues:
1. Check the backend console logs for detailed error messages
2. Verify your Google Cloud Console configuration
3. Ensure all environment variables are set correctly
4. Test with a fresh browser session (clear cookies/cache) 