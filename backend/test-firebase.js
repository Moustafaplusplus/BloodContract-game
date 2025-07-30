import { uploadToFirebase } from './src/config/firebase.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testFirebaseConnection() {
  console.log('🧪 Testing Firebase Configuration...');
  console.log('=====================================');
  
  // Check environment variables
  const requiredEnvVars = [
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
  
  console.log('\n📋 Environment Variables Check:');
  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar];
    if (value) {
      console.log(`✅ ${envVar}: ${envVar.includes('KEY') ? '***SET***' : value}`);
    } else {
      console.log(`❌ ${envVar}: NOT SET`);
    }
  }
  
  // Test Firebase upload with a small test file
  console.log('\n🔥 Testing Firebase Upload...');
  try {
    // Create a small test image buffer
    const testBuffer = Buffer.from('fake-image-data-for-testing');
    const testFilename = `test-${Date.now()}.txt`;
    
    console.log('📤 Attempting to upload test file...');
    const result = await uploadToFirebase(testBuffer, 'test', testFilename);
    
    console.log('✅ Firebase upload successful!');
    console.log('📊 Upload result:', {
      publicUrl: result.publicUrl,
      filePath: result.filePath,
      filename: result.filename
    });
    
    // Test with a real image file
    console.log('\n🖼️ Testing with real image file...');
    const avatarPath = path.join(__dirname, 'public', 'avatars', 'default_avatar_mal.jpeg');
    
    if (fs.existsSync(avatarPath)) {
      const imageBuffer = fs.readFileSync(avatarPath);
      const imageFilename = `test-avatar-${Date.now()}.jpeg`;
      
      console.log('📤 Uploading test avatar...');
      const imageResult = await uploadToFirebase(imageBuffer, 'test', imageFilename);
      
      console.log('✅ Image upload successful!');
      console.log('📊 Image upload result:', {
        publicUrl: imageResult.publicUrl,
        filePath: imageResult.filePath,
        filename: imageResult.filename
      });
      
      // Test if the URL is accessible
      console.log('\n🔗 Testing URL accessibility...');
      try {
        const response = await fetch(imageResult.publicUrl);
        if (response.ok) {
          console.log('✅ Image URL is accessible!');
        } else {
          console.log('⚠️ Image URL returned status:', response.status);
        }
      } catch (urlError) {
        console.log('⚠️ Could not test URL accessibility:', urlError.message);
      }
      
    } else {
      console.log('⚠️ Test image file not found:', avatarPath);
    }
    
  } catch (error) {
    console.error('❌ Firebase test failed:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
  }
}

testFirebaseConnection(); 