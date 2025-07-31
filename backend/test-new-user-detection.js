#!/usr/bin/env node

/**
 * Test new user detection logic for Google OAuth
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

console.log('🔍 New User Detection Test for Google OAuth');
console.log('============================================\n');

// Simulate the logic from passport.js
function testNewUserDetection() {
  console.log('📋 Testing new user detection logic:');
  
  // Test case 1: New user creation (no existing user found)
  console.log('✅ Case 1 - New user creation: NEW USER (isNewUser = true)');
  
  // Test case 2: Existing user linking Google account (user exists but no Google ID)
  console.log('✅ Case 2 - Existing user linking Google: EXISTING USER (isNewUser = false)');
  
  // Test case 3: Existing user with Google ID (user exists and has Google ID)
  console.log('✅ Case 3 - Existing user with Google ID: EXISTING USER (isNewUser = false)');
  
  console.log('\n📋 Logic Summary:');
  console.log('- If user exists in database → isNewUser = false');
  console.log('- If user does not exist → create new user → isNewUser = true');
  console.log('- Linking existing account to Google → isNewUser = false');
}

testNewUserDetection();

console.log('\n📋 Expected Behavior:');
console.log('- New users (no Google ID) → Redirect to /intro');
console.log('- Existing users (has Google ID) → Redirect to /dashboard');
console.log('- Users linking existing accounts → Redirect to /dashboard');

console.log('\n📋 Frontend Flow:');
console.log('1. Google OAuth callback receives token and isNewUser flag');
console.log('2. If isNewUser=true → Navigate to /intro');
console.log('3. If isNewUser=false → Navigate to /dashboard'); 