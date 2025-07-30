import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { uploadToFirebase } from './src/config/firebase.js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function uploadDefaultAvatars() {
  try {
    const avatarsDir = path.join(__dirname, 'public', 'avatars');
    
    // Upload default male avatar
    const maleAvatarPath = path.join(avatarsDir, 'default_avatar_mal.jpeg');
    if (fs.existsSync(maleAvatarPath)) {
      const maleBuffer = fs.readFileSync(maleAvatarPath);
      const maleResult = await uploadToFirebase(maleBuffer, 'avatars', 'default_avatar_mal.jpeg');
      console.log('✅ Default male avatar uploaded:', maleResult.publicUrl);
    }
    
    // Upload default female avatar
    const femaleAvatarPath = path.join(avatarsDir, 'default_avatar_femal.jpeg');
    if (fs.existsSync(femaleAvatarPath)) {
      const femaleBuffer = fs.readFileSync(femaleAvatarPath);
      const femaleResult = await uploadToFirebase(femaleBuffer, 'avatars', 'default_avatar_femal.jpeg');
      console.log('✅ Default female avatar uploaded:', femaleResult.publicUrl);
    }
    
    console.log('🎉 Default avatars uploaded successfully!');
    console.log('📝 Update your environment variables with these URLs:');
    console.log('DEFAULT_AVATAR_MALE_URL=<male-avatar-url>');
    console.log('DEFAULT_AVATAR_FEMALE_URL=<female-avatar-url>');
    
  } catch (error) {
    console.error('❌ Error uploading default avatars:', error);
  }
}

uploadDefaultAvatars(); 