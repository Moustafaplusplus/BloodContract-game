import admin from 'firebase-admin';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin
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

console.log('Firebase configuration check:');
console.log('Project ID:', process.env.FIREBASE_PROJECT_ID);
console.log('Client Email:', process.env.FIREBASE_CLIENT_EMAIL);
console.log('Private Key Length:', process.env.FIREBASE_PRIVATE_KEY?.length || 0);

try {
  const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
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
} 