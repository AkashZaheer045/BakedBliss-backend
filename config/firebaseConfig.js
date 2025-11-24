const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin SDK with flexible credential sources:
// 1. If FIREBASE_ADMIN_SDK_PATH env var is set, load that JSON file
// 2. Else if GOOGLE_APPLICATION_CREDENTIALS is set, the Admin SDK will use it automatically
// 3. Else attempt default initializeApp() (may work on GCP environments)

try {
  if (process.env.FIREBASE_ADMIN_SDK_PATH) {
    const sdkPath = path.resolve(process.env.FIREBASE_ADMIN_SDK_PATH);
    if (!fs.existsSync(sdkPath)) {
      throw new Error(`FIREBASE_ADMIN_SDK_PATH set but file not found: ${sdkPath}`);
    }
    const serviceAccount = require(sdkPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Firebase Admin SDK initialized with service account credentials');
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // Let firebase-admin pick up the credentials from GOOGLE_APPLICATION_CREDENTIALS
    admin.initializeApp();
    console.log('✅ Firebase Admin SDK initialized with GOOGLE_APPLICATION_CREDENTIALS');
  } else {
    // Try to initialize with default credentials (useful on GCP or when ADC is available)
    // console.warn('No explicit Firebase admin credentials provided. Calling initializeApp() and relying on default credentials.');
    admin.initializeApp();
  }
} catch (err) {
  console.error('Failed to initialize Firebase Admin SDK:', err.message);
  // still attempt to initialize without credentials to allow other parts of app to load
  try { admin.initializeApp(); } catch (e) { /* ignore */ }
}

const db = admin.firestore();
console.log('Connected to Firestore Database');
module.exports = { admin, db };
