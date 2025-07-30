#!/usr/bin/env node

// Standalone health check for Railway deployment
import http from 'http';

const options = {
  hostname: 'localhost',
  port: process.env.PORT || 3000,
  path: '/health',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  console.log(`✅ Health check passed: ${res.statusCode}`);
  process.exit(0);
});

req.on('error', (err) => {
  console.error(`❌ Health check failed: ${err.message}`);
  process.exit(1);
});

req.on('timeout', () => {
  console.error('❌ Health check timed out');
  req.destroy();
  process.exit(1);
});

req.end(); 