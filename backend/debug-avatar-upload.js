import { uploadToFirebase } from './src/config/firebase.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function debugAvatarUpload() {
  console.log('🔍 Debugging Avatar Upload Process...');
  console.log('=====================================');
  
  try {
    // Simulate the exact process from UserController
    const testBuffer = fs.readFileSync(path.join(__dirname, 'public', 'avatars', 'default_avatar_mal.jpeg'));
    const userId = 6; // From your console log
    const timestamp = Date.now();
    const ext = 'jpeg';
    const filename = `user_${userId}_${timestamp}.${ext}`;
    
    console.log('📁 Simulating avatar upload with:');
    console.log('- User ID:', userId);
    console.log('- Filename:', filename);
    console.log('- Buffer size:', testBuffer.length);
    
    console.log('\n🔥 Calling uploadToFirebase...');
    const result = await uploadToFirebase(testBuffer, 'avatars', filename);
    
    console.log('\n📊 Upload result:');
    console.log('- publicUrl:', result.publicUrl);
    console.log('- filePath:', result.filePath);
    console.log('- filename:', result.filename);
    
    console.log('\n🔍 URL Analysis:');
    console.log('- Is Firebase URL?', result.publicUrl.startsWith('https://storage.googleapis.com/'));
    console.log('- URL length:', result.publicUrl.length);
    console.log('- Full URL:', result.publicUrl);
    
    // Test if the URL is accessible
    console.log('\n🔗 Testing URL accessibility...');
    try {
      const response = await fetch(result.publicUrl);
      console.log('- Response status:', response.status);
      console.log('- Response OK?', response.ok);
      if (response.ok) {
        console.log('✅ URL is accessible!');
      } else {
        console.log('❌ URL returned error status');
      }
    } catch (urlError) {
      console.log('❌ URL accessibility test failed:', urlError.message);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
  }
}

debugAvatarUpload(); 