#!/usr/bin/env node

/**
 * Setup script to help configure Firebase Storage environment variables
 * This script will guide you through setting up Firebase for your application
 */

import fs from 'fs';
import path from 'path';

const setupFirebase = () => {
  console.log('🚀 Firebase Storage Setup Guide');
  console.log('==============================\n');
  
  console.log('📋 Step 1: Create Firebase Project');
  console.log('1. Go to https://console.firebase.google.com');
  console.log('2. Create a new project or select existing one');
  console.log('3. Enable Firebase Storage in your project\n');
  
  console.log('📋 Step 2: Get Your Firebase Service Account');
  console.log('1. Go to Project Settings (gear icon)');
  console.log('2. Go to "Service accounts" tab');
  console.log('3. Click "Generate new private key"');
  console.log('4. Download the JSON file\n');
  
  console.log('📋 Step 3: Set Environment Variables');
  console.log('You need to set these environment variables from your service account JSON:');
  console.log('');
  console.log('FIREBASE_TYPE=service_account');
  console.log('FIREBASE_PROJECT_ID=your-project-id');
  console.log('FIREBASE_PRIVATE_KEY_ID=your-private-key-id');
  console.log('FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"');
  console.log('FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com');
  console.log('FIREBASE_CLIENT_ID=your-client-id');
  console.log('FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth');
  console.log('FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token');
  console.log('FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs');
  console.log('FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project.iam.gserviceaccount.com');
  console.log('FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com');
  console.log('');
  
  console.log('📋 Step 4: For Local Development');
  console.log('Create a .env file in the backend directory with all the above variables');
  console.log('');
  
  console.log('📋 Step 5: For Railway Deployment');
  console.log('Add these variables to your Railway project:');
  console.log('1. Go to your Railway project dashboard');
  console.log('2. Select your backend service');
  console.log('3. Go to "Variables" tab');
  console.log('4. Add all the FIREBASE_* variables');
  console.log('');
  
  console.log('📋 Step 6: Configure Firebase Storage Rules');
  console.log('In your Firebase console, go to Storage > Rules and set:');
  console.log('');
  console.log('rules_version = "2";');
  console.log('service firebase.storage {');
  console.log('  match /b/{bucket}/o {');
  console.log('    match /bloodcontract/{allPaths=**} {');
  console.log('      allow read: if true;');
  console.log('      allow write: if request.auth != null;');
  console.log('    }');
  console.log('  }');
  console.log('}');
  console.log('');
  
  console.log('📋 Step 7: Test Configuration');
  console.log('After setting up, run:');
  console.log('node upload-default-avatars.js');
  console.log('');
  
  console.log('❓ Need Help?');
  console.log('- Check the FIREBASE_SETUP.md file');
  console.log('- Review the DEFAULT_AVATARS_SETUP.md file');
  console.log('- Contact Firebase support if needed');
  console.log('');
  
  // Check if .env file exists
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    console.log('✅ .env file found in backend directory');
  } else {
    console.log('⚠️  No .env file found. Create one for local development.');
  }
  
  console.log('🎉 Setup guide completed!');
};

setupFirebase(); 