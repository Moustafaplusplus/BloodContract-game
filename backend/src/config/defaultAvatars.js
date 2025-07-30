/**
 * Default avatar URLs for the application
 * These should be uploaded to Firebase Storage and the URLs updated here
 */

export const DEFAULT_AVATARS = {
  MALE: process.env.DEFAULT_AVATAR_MALE_URL || 'https://storage.googleapis.com/bloodcontractgame.firebasestorage.app/bloodcontract/avatars/default_avatar_male',
  FEMALE: process.env.DEFAULT_AVATAR_FEMALE_URL || 'https://storage.googleapis.com/bloodcontractgame.firebasestorage.app/bloodcontract/avatars/default_avatar_female'
};

/**
 * Get default avatar URL based on gender
 * @param {string} gender - 'male' or 'female'
 * @returns {string} - Default avatar URL
 */
export const getDefaultAvatarUrl = (gender) => {
  return gender === 'female' ? DEFAULT_AVATARS.FEMALE : DEFAULT_AVATARS.MALE;
};

/**
 * Check if an avatar URL is a default avatar
 * @param {string} avatarUrl - The avatar URL to check
 * @returns {boolean} - True if it's a default avatar
 */
export const isDefaultAvatar = (avatarUrl) => {
  if (!avatarUrl) return true;
  
  return avatarUrl === DEFAULT_AVATARS.MALE || 
         avatarUrl === DEFAULT_AVATARS.FEMALE ||
         avatarUrl.includes('default_avatar_male') ||
         avatarUrl.includes('default_avatar_female');
}; 