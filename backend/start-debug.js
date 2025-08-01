#!/usr/bin/env node

// Debug startup script for Railway deployment
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Starting debug mode...');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Port:', process.env.PORT || 3000);
console.log('Working directory:', process.cwd());

// Check if we're in the right directory
const packageJsonPath = path.join(__dirname, 'package.json');
try {
  const packageJson = JSON.parse(await import('fs').then(fs => fs.readFileSync(packageJsonPath, 'utf8')));
  console.log('📦 Package.json found:', packageJson.name);
} catch (error) {
  console.error('❌ Package.json not found or invalid');
  process.exit(1);
}

// Start the server with detailed logging
const serverProcess = spawn('node', ['src/app.js'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DEBUG: '*'
  }
});

serverProcess.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

serverProcess.on('exit', (code) => {
  console.log(`Server process exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down...');
  serverProcess.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down...');
  serverProcess.kill('SIGINT');
}); 