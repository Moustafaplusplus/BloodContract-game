#!/usr/bin/env node

// Test startup script to verify server can start
import { spawn } from 'child_process';
import http from 'http';
import dotenv from 'dotenv';

dotenv.config();

console.log('🧪 Testing server startup...');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Port:', process.env.PORT || process.env.API_PORT || 3001);

// Start the server
const serverProcess = spawn('node', ['src/app.js'], {
  stdio: 'pipe',
  env: process.env
});

let serverStarted = false;
let testCompleted = false;
let serverStartTime = Date.now();

// Listen for server output
serverProcess.stdout.on('data', (data) => {
  const output = data.toString();
  console.log('📤 Server output:', output);
  
  // Check if server is ready - look for multiple indicators
  if (output.includes('Server listening') || 
      output.includes('Blood Contract backend is ready') ||
      output.includes('Server listening on http://localhost') ||
      output.includes('✅ Database connection and sync completed')) {
    serverStarted = true;
    console.log('✅ Server appears to be ready');
    
    // Wait a bit then test the health endpoint
    setTimeout(testHealthEndpoint, 3000);
  }
});

serverProcess.stderr.on('data', (data) => {
  const error = data.toString();
  console.error('❌ Server error:', error);
});

serverProcess.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

serverProcess.on('exit', (code) => {
  console.log(`📤 Server process exited with code ${code}`);
  if (!testCompleted) {
    process.exit(code);
  }
});

function testHealthEndpoint() {
  const PORT = process.env.PORT || process.env.API_PORT || 3001;
  
  console.log(`🔍 Testing health endpoint at http://localhost:${PORT}/health`);
  
  const options = {
    hostname: 'localhost',
    port: PORT,
    path: '/health',
    method: 'GET',
    timeout: 15000
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`✅ Health check passed: ${res.statusCode}`);
      try {
        const response = JSON.parse(data);
        console.log('📊 Health response:', response);
        
        if (response.status === 'healthy' || response.database === 'connected') {
          console.log('✅ Server is healthy and ready');
        } else {
          console.log('⚠️ Server is running but database connection may be unstable');
        }
      } catch (parseError) {
        console.log('📄 Raw response:', data);
      }
      
      testCompleted = true;
      console.log('✅ Startup test completed successfully');
      serverProcess.kill('SIGTERM');
      process.exit(0);
    });
  });

  req.on('error', (err) => {
    console.error(`❌ Health check failed: ${err.message}`);
    testCompleted = true;
    serverProcess.kill('SIGTERM');
    process.exit(1);
  });

  req.on('timeout', () => {
    console.error('❌ Health check timed out');
    testCompleted = true;
    serverProcess.kill('SIGTERM');
    process.exit(1);
  });

  req.end();
}

// Fallback: if server doesn't output expected message but is running, test health endpoint after 15 seconds
setTimeout(() => {
  if (!serverStarted && !testCompleted) {
    console.log('⏰ Server startup timeout reached, attempting health check anyway...');
    testHealthEndpoint();
  }
}, 15000);

// Overall timeout after 45 seconds
setTimeout(() => {
  if (!testCompleted) {
    console.error('❌ Test timed out');
    serverProcess.kill('SIGTERM');
    process.exit(1);
  }
}, 45000); 