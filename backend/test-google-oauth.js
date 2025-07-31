#!/usr/bin/env node

/**
 * Google OAuth Configuration Test Script
 * Run this script to verify your Google OAuth setup
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

console.log('🔍 Google OAuth Configuration Test');
console.log('=====================================\n');

// Check required environment variables
const requiredVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'JWT_SECRET',
  'CLIENT_URL'
];

console.log('📋 Checking Environment Variables:');
let allVarsPresent = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 10)}...`);
  } else {
    console.log(`❌ ${varName}: NOT SET`);
    allVarsPresent = false;
  }
});

console.log('\n📋 Checking Google OAuth Configuration:');

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  console.log('✅ Google OAuth credentials are configured');
  
  // Validate Client ID format (Google Client IDs are typically long)
  if (process.env.GOOGLE_CLIENT_ID.length > 20) {
    console.log('✅ Client ID format appears valid');
  } else {
    console.log('⚠️  Client ID seems too short - please verify');
  }
  
  // Validate Client Secret format
  if (process.env.GOOGLE_CLIENT_SECRET.length > 20) {
    console.log('✅ Client Secret format appears valid');
  } else {
    console.log('⚠️  Client Secret seems too short - please verify');
  }
} else {
  console.log('❌ Google OAuth credentials are missing');
}

console.log('\n📋 Checking URLs:');

const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
console.log(`✅ Client URL: ${clientUrl}`);

const callbackUrl = process.env.NODE_ENV === 'production' 
  ? `${clientUrl}/api/auth/google/callback`
  : 'http://localhost:3000/api/auth/google/callback';
console.log(`✅ Callback URL: ${callbackUrl}`);

console.log('\n📋 Recommendations:');

if (!allVarsPresent) {
  console.log('❌ Please set all required environment variables');
  console.log('   Create a .env file in the backend directory with:');
  console.log('   GOOGLE_CLIENT_ID=your_client_id');
  console.log('   GOOGLE_CLIENT_SECRET=your_client_secret');
  console.log('   JWT_SECRET=your_jwt_secret');
  console.log('   CLIENT_URL=http://localhost:5173');
} else {
  console.log('✅ All environment variables are set');
  console.log('✅ You can now test Google OAuth');
  console.log('\n🚀 Next steps:');
  console.log('1. Start your backend server: pnpm dev');
  console.log('2. Start your frontend: cd ../frontend && pnpm dev');
  console.log('3. Go to your login page and test Google sign-in');
}

console.log('\n📖 For detailed setup instructions, see: GOOGLE_OAUTH_SETUP.md'); 