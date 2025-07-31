#!/usr/bin/env node

/**
 * Test callback URL configuration
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

console.log('🔍 Callback URL Configuration Test');
console.log('==================================\n');

const isProduction = process.env.NODE_ENV === 'production';
const callbackURL = isProduction 
  ? "https://bloodcontract-game-production.up.railway.app/api/auth/google/callback"
  : "http://localhost:3000/api/auth/google/callback";

console.log('📋 Environment:', isProduction ? 'Production' : 'Development');
console.log('🔗 Callback URL:', callbackURL);
console.log('');

console.log('📋 Google Cloud Console Configuration:');
console.log('✅ Make sure this exact URL is in your "Authorized redirect URIs":');
console.log(`   ${callbackURL}`);
console.log('');

console.log('📋 Expected Google Cloud Console Settings:');
console.log('Authorized JavaScript origins:');
console.log('  - http://localhost:5173');
console.log('  - http://localhost:3000');
console.log('');
console.log('Authorized redirect URIs:');
console.log(`  - ${callbackURL}`);
console.log('');

if (isProduction) {
  console.log('⚠️  IMPORTANT: Make sure to remove localhost redirect URIs from Google Cloud Console');
  console.log('   Only keep the production Railway URL in redirect URIs');
} 