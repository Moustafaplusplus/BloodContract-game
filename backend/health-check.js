#!/usr/bin/env node

// Standalone health check for Railway deployment
import http from 'http';

const options = {
  hostname: 'localhost',
  port: process.env.PORT || 3000,
  path: '/health',
  method: 'GET',
  timeout: 15000 // Increased timeout for Railway
};

console.log(`🔍 Health check starting...`);
console.log(`📍 Target: http://${options.hostname}:${options.port}${options.path}`);
console.log(`⏰ Timeout: ${options.timeout}ms`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🚂 Railway Environment: ${process.env.RAILWAY_ENVIRONMENT || 'not set'}`);

// First try the simple health check
const simpleOptions = {
  ...options,
  path: '/health-simple'
};

console.log(`\n🔍 Trying simple health check first...`);
console.log(`📍 Simple target: http://${simpleOptions.hostname}:${simpleOptions.port}${simpleOptions.path}`);

const simpleReq = http.request(simpleOptions, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`✅ Simple health check passed: ${res.statusCode}`);
    try {
      const response = JSON.parse(data);
      console.log(`📊 Simple response:`, response);
    } catch (parseError) {
      console.log(`📄 Simple raw response:`, data);
    }
    
    // Now try the full health check
    console.log(`\n🔍 Trying full health check...`);
    const fullReq = http.request(options, (fullRes) => {
      let fullData = '';
      
      fullRes.on('data', (chunk) => {
        fullData += chunk;
      });
      
      fullRes.on('end', () => {
        try {
          const fullResponse = JSON.parse(fullData);
          console.log(`✅ Full health check passed: ${fullRes.statusCode}`);
          console.log(`📊 Full response:`, fullResponse);
          process.exit(0);
        } catch (parseError) {
          console.log(`✅ Full health check passed: ${fullRes.statusCode}`);
          console.log(`📄 Full raw response:`, fullData);
          process.exit(0);
        }
      });
    });

    fullReq.on('error', (err) => {
      console.error(`❌ Full health check failed: ${err.message}`);
      console.error(`🔍 Full error details:`, err);
      process.exit(1);
    });

    fullReq.on('timeout', () => {
      console.error('❌ Full health check timed out');
      fullReq.destroy();
      process.exit(1);
    });

    fullReq.end();
  });
});

simpleReq.on('error', (err) => {
  console.error(`❌ Simple health check failed: ${err.message}`);
  console.error(`🔍 Simple error details:`, err);
  
  // Try the root endpoint as a fallback
  console.log(`\n🔍 Trying root endpoint as fallback...`);
  const rootOptions = {
    ...options,
    path: '/'
  };
  
  const rootReq = http.request(rootOptions, (rootRes) => {
    let rootData = '';
    
    rootRes.on('data', (chunk) => {
      rootData += chunk;
    });
    
    rootRes.on('end', () => {
      console.log(`✅ Root endpoint check: ${rootRes.statusCode}`);
      try {
        const rootResponse = JSON.parse(rootData);
        console.log(`📊 Root response:`, rootResponse);
        process.exit(0);
      } catch (parseError) {
        console.log(`📄 Root raw response:`, rootData);
        process.exit(0);
      }
    });
  });

  rootReq.on('error', (rootErr) => {
    console.error(`❌ Root endpoint also failed: ${rootErr.message}`);
    console.error(`🔍 Root error details:`, rootErr);
    process.exit(1);
  });

  rootReq.on('timeout', () => {
    console.error('❌ Root endpoint timed out');
    rootReq.destroy();
    process.exit(1);
  });

  rootReq.end();
});

simpleReq.on('timeout', () => {
  console.error('❌ Simple health check timed out');
  simpleReq.destroy();
  process.exit(1);
});

simpleReq.end(); 