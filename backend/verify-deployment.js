#!/usr/bin/env node

// Deployment verification script
import http from 'http';
import { sequelize } from './src/config/db.js';

console.log('🔍 Starting deployment verification...');

const checks = {
  database: false,
  server: false,
  health: false
};

// Check database connection
async function checkDatabase() {
  try {
    console.log('🗄️  Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection: OK');
    checks.database = true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    checks.database = false;
  }
}

// Check if server is running
function checkServer() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: process.env.PORT || 3000,
      path: '/health',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      console.log(`✅ Server health check: ${res.statusCode}`);
      checks.server = true;
      resolve();
    });

    req.on('error', (err) => {
      console.error('❌ Server health check failed:', err.message);
      checks.server = false;
      resolve();
    });

    req.on('timeout', () => {
      console.error('❌ Server health check timed out');
      checks.server = false;
      resolve();
    });

    req.end();
  });
}

// Check environment variables
function checkEnvironment() {
  console.log('🔧 Checking environment variables...');
  
  const requiredVars = [
    'DATABASE_URL',
    'PORT',
    'NODE_ENV'
  ];

  const optionalVars = [
    'FIREBASE_TYPE',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_CLIENT_ID',
    'FIREBASE_AUTH_URI',
    'FIREBASE_TOKEN_URI',
    'FIREBASE_AUTH_PROVIDER_X509_CERT_URL',
    'FIREBASE_CLIENT_X509_CERT_URL',
    'FIREBASE_STORAGE_BUCKET'
  ];

  console.log('📋 Required variables:');
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`  ✅ ${varName}: ${varName.includes('PASSWORD') || varName.includes('KEY') ? '***' : value.substring(0, 20) + '...'}`);
    } else {
      console.log(`  ❌ ${varName}: MISSING`);
    }
  });

  console.log('📋 Optional variables:');
  optionalVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`  ✅ ${varName}: ${varName.includes('PASSWORD') || varName.includes('KEY') ? '***' : value.substring(0, 20) + '...'}`);
    } else {
      console.log(`  ⚠️  ${varName}: NOT SET`);
    }
  });
}

// Main verification
async function verifyDeployment() {
  console.log('🚀 Starting deployment verification...');
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log('Port:', process.env.PORT || 3000);
  
  // Check environment variables
  checkEnvironment();
  
  // Check database
  await checkDatabase();
  
  // Wait a bit for server to start
  console.log('⏳ Waiting 10 seconds for server to start...');
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  // Check server
  await checkServer();
  
  // Summary
  console.log('\n📊 Verification Summary:');
  console.log(`Database: ${checks.database ? '✅ OK' : '❌ FAILED'}`);
  console.log(`Server: ${checks.server ? '✅ OK' : '❌ FAILED'}`);
  
  const allPassed = Object.values(checks).every(check => check);
  
  if (allPassed) {
    console.log('🎉 All checks passed! Deployment is ready.');
    process.exit(0);
  } else {
    console.log('⚠️  Some checks failed. Please review the logs above.');
    process.exit(1);
  }
}

verifyDeployment().catch(error => {
  console.error('❌ Verification failed:', error);
  process.exit(1);
}); 