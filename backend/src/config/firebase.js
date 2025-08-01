import admin from 'firebase-admin';
import { getStorage } from 'firebase-admin/storage';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin
let app;
try {
  // Try to get existing app
  app = admin.app();
  console.log('✅ Firebase Admin SDK already initialized');
} catch (error) {
  // Initialize new app if none exists
  console.log('🔄 Initializing Firebase Admin SDK...');
  
  // Check if required environment variables are present
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
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    console.error('❌ Missing Firebase environment variables:', missingVars);
    throw new Error(`Missing Firebase environment variables: ${missingVars.join(', ')}`);
  }
  
  const serviceAccount = {
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n').replace(/"/g, ''),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
  };

  console.log('📋 Firebase service account config:', {
    type: serviceAccount.type,
    project_id: serviceAccount.project_id,
    client_email: serviceAccount.client_email,
    private_key_length: serviceAccount.private_key?.length || 0
  });

  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
  
  console.log('✅ Firebase Admin SDK initialized successfully');
}

const bucket = getStorage(app).bucket();

/**
 * Upload file to Firebase Storage
 * @param {Buffer} fileBuffer - The file buffer
 * @param {string} folder - The folder to upload to (e.g., 'weapons', 'armors', etc.)
 * @param {string} filename - The filename
 * @returns {Promise<Object>} - Firebase upload result
 */
export const uploadToFirebase = async (fileBuffer, folder, filename) => {
  try {
    console.log('🔥 Starting Firebase upload...');
    console.log('🔥 Firebase bucket:', bucket.name);
    console.log('🔥 File buffer size:', fileBuffer.length);
    
    const filePath = `bloodcontract/${folder}/${filename}`;
    console.log('🔥 Firebase upload path:', filePath);
    const file = bucket.file(filePath);
    
    // Upload with public read access
    console.log('🔥 Uploading to Firebase...');
    await file.save(fileBuffer, {
      metadata: {
        contentType: 'image/jpeg', // You might want to detect this dynamically
        cacheControl: 'public, max-age=31536000'
      },
      public: true // Make file publicly readable
    });
    console.log('🔥 File saved to Firebase successfully');

    // Get the public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
    console.log('🔥 Firebase bucket name:', bucket.name);
    console.log('🔥 Firebase public URL:', publicUrl);
    
    return {
      publicUrl,
      filePath,
      filename
    };
  } catch (error) {
    console.error('❌ Firebase upload error:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    throw error;
  }
};

/**
 * Delete file from Firebase Storage
 * @param {string} filePath - The file path in Firebase Storage
 * @returns {Promise<Object>} - Firebase delete result
 */
export const deleteFromFirebase = async (filePath) => {
  try {
    const file = bucket.file(filePath);
    await file.delete();
    return { success: true };
  } catch (error) {
    console.error('Error deleting from Firebase:', error);
    throw error;
  }
};

/**
 * Get optimized image URL
 * @param {string} filePath - The file path in Firebase Storage
 * @param {Object} options - Transformation options
 * @returns {string} - Optimized image URL
 */
export const getOptimizedImageUrl = (filePath, options = {}) => {
  if (!filePath) return null;
  
  // For now, return the direct URL
  // You can add Firebase Storage transformations later if needed
  return `https://storage.googleapis.com/${bucket.name}/${filePath}`;
};

export default app; 