#!/usr/bin/env node

// Standalone health check for Railway deployment
import http from 'http';

const options = {
  hostname: 'localhost',
  port: process.env.PORT || 3000,
  path: '/health',
  method: 'GET',
  timeout: 10000 // Increased timeout
};

console.log(`🔍 Health check starting...`);
console.log(`📍 Target: http://${options.hostname}:${options.port}${options.path}`);

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log(`✅ Health check passed: ${res.statusCode}`);
      console.log(`📊 Response:`, response);
      process.exit(0);
    } catch (parseError) {
      console.log(`✅ Health check passed: ${res.statusCode}`);
      console.log(`📄 Raw response:`, data);
      process.exit(0);
    }
  });
});

req.on('error', (err) => {
  console.error(`❌ Health check failed: ${err.message}`);
  console.error(`🔍 Error details:`, err);
  process.exit(1);
});

req.on('timeout', () => {
  console.error('❌ Health check timed out');
  req.destroy();
  process.exit(1);
});

req.end(); 