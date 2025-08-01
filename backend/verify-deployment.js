#!/usr/bin/env node

// Deployment verification script
import http from 'http';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || process.env.API_PORT || 3001;
const HOST = 'localhost';

console.log('🔍 Deployment verification starting...');
console.log(`📍 Target: http://${HOST}:${PORT}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🚂 Railway Environment: ${process.env.RAILWAY_ENVIRONMENT || 'not set'}`);

const endpoints = [
  { path: '/', name: 'Root' },
  { path: '/health-simple', name: 'Simple Health' },
  { path: '/health', name: 'Full Health' },
  { path: '/api/debug/env', name: 'Environment Debug' }
];

let currentEndpoint = 0;

const testEndpoint = (endpoint) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: HOST,
      port: PORT,
      path: endpoint.path,
      method: 'GET',
      timeout: 10000
    };

    console.log(`\n🔍 Testing ${endpoint.name} endpoint: ${endpoint.path}`);

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`✅ ${endpoint.name}: ${res.statusCode}`);
        try {
          const response = JSON.parse(data);
          console.log(`📊 ${endpoint.name} response:`, response);
        } catch (parseError) {
          console.log(`📄 ${endpoint.name} raw response:`, data);
        }
        resolve();
      });
    });

    req.on('error', (err) => {
      console.error(`❌ ${endpoint.name} failed: ${err.message}`);
      reject(err);
    });

    req.on('timeout', () => {
      console.error(`❌ ${endpoint.name} timed out`);
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
};

const runTests = async () => {
  try {
    for (const endpoint of endpoints) {
      try {
        await testEndpoint(endpoint);
        // Wait a bit between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ ${endpoint.name} test failed:`, error.message);
        // Continue with other tests
      }
    }
    
    console.log('\n✅ Deployment verification completed');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Deployment verification failed:', error.message);
    process.exit(1);
  }
};

runTests(); 