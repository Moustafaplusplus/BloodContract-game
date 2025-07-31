import { sequelize } from './src/config/db.js';
import { User } from './src/models/User.js';

const correctMaleAvatar = 'https://storage.googleapis.com/bloodcontractgame.firebasestorage.app/bloodcontract/avatars/default_avatar_mal.jpeg';
const correctFemaleAvatar = 'https://storage.googleapis.com/bloodcontractgame.firebasestorage.app/bloodcontract/avatars/default_avatar_femal.jpeg';

async function fixAvatarUrls() {
  try {
    console.log('🔧 Fixing avatar URLs in database...');
    
    // Update male users with incorrect avatar URL
    const maleResult = await User.update(
      { avatarUrl: correctMaleAvatar },
      { 
        where: { 
          avatarUrl: 'https://storage.googleapis.com/bloodcontractgame.firebasestorage.app/bloodcontract/avatars/default_avatar_male',
                  gender: 'male'
        }
      }
    );
    
    // Update female users with incorrect avatar URL
    const femaleResult = await User.update(
      { avatarUrl: correctFemaleAvatar },
      { 
        where: { 
          avatarUrl: 'https://storage.googleapis.com/bloodcontractgame.firebasestorage.app/bloodcontract/avatars/default_avatar_female',
                  gender: 'female'
        }
      }
    );
    
    console.log(`✅ Updated ${maleResult[0]} male users`);
    console.log(`✅ Updated ${femaleResult[0]} female users`);
    console.log('🎉 Avatar URLs fixed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing avatar URLs:', error);
    process.exit(1);
  }
}

fixAvatarUrls(); 