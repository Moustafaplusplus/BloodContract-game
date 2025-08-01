#!/usr/bin/env node

// Debug startup script for Railway deployment
import dotenv from 'dotenv';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

console.log('🔍 Debug startup script starting...');
console.log('Environment variables:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- PORT:', process.env.PORT);
console.log('- API_PORT:', process.env.API_PORT);
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? 'present' : 'missing');
console.log('- RAILWAY_ENVIRONMENT:', process.env.RAILWAY_ENVIRONMENT);

// Check if we're in Railway
if (process.env.RAILWAY_ENVIRONMENT) {
  console.log('🚂 Running in Railway environment');
} else {
  console.log('💻 Running in local environment');
}

// Start the main application
console.log('\n🚀 Starting main application...');
const appProcess = spawn('node', ['src/app.js'], {
  stdio: 'inherit',
  env: process.env
});

appProcess.on('error', (error) => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
});

appProcess.on('exit', (code) => {
  console.log(`📤 Application exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down...');
  appProcess.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down...');
  appProcess.kill('SIGINT');
}); 