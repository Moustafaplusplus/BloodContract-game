import admin from 'firebase-admin';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🔍 Checking Firebase environment variables on Railway...');

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

console.log('📋 Environment variables status:');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  const hasValue = !!value;
  const preview = value ? (varName.includes('PRIVATE_KEY') ? `${value.substring(0, 20)}...` : value.substring(0, 50)) : 'NOT SET';
  console.log(`${hasValue ? '✅' : '❌'} ${varName}: ${preview}`);
});

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ Missing Firebase environment variables:', missingVars);
  process.exit(1);
}

console.log('✅ All Firebase environment variables are present');

try {
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

  const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
  
  console.log('✅ Firebase Admin SDK initialized successfully');
  
  // Test creating a custom token for anonymous user
  const testUid = 'test-anonymous-user';
  const customToken = await admin.auth().createCustomToken(testUid);
  console.log('✅ Custom token created successfully');
  console.log('Token preview:', customToken.substring(0, 20) + '...');
  
} catch (error) {
  console.error('❌ Firebase configuration error:', error);
  console.error('Error details:', {
    message: error.message,
    code: error.code,
    name: error.name
  });
  process.exit(1);
} 