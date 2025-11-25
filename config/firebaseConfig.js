const path = require('path');
const fs = require('fs');

// Set environment variables early if service account path is available.
// If FIREBASE_ADMIN_SDK_PATH is set but points to a path that doesn't exist,
// try a couple of reasonable fallbacks (project root, config parent) before giving up.
function findServiceAccountPath(envPath) {
  if (!envPath) return null;
  const candidates = [];
  try {
    candidates.push(path.resolve(envPath));
  } catch (e) {}
  // basename in case envPath points to a different workspace layout
  const base = path.basename(envPath || '');
  if (base) {
    candidates.push(path.resolve(process.cwd(), base));
    candidates.push(path.resolve(__dirname, '..', base));
  }
  for (const p of candidates) {
    if (p && fs.existsSync(p)) return p;
  }
  return null;
}

if (process.env.FIREBASE_ADMIN_SDK_PATH) {
  const sdkPath = findServiceAccountPath(process.env.FIREBASE_ADMIN_SDK_PATH);
  if (sdkPath) {
    try {
      const serviceAccount = require(sdkPath);
      // Set environment variables BEFORE requiring firebase-admin
      process.env.GOOGLE_CLOUD_PROJECT = serviceAccount.project_id;
      process.env.GCLOUD_PROJECT = serviceAccount.project_id;
      process.env.FIREBASE_CONFIG = JSON.stringify({
        projectId: serviceAccount.project_id,
        databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
      });
      console.log(`🔧 Environment variables set for project: ${serviceAccount.project_id} (from ${sdkPath})`);
    } catch (err) {
      console.error('Failed to load service account for environment setup:', err.message);
    }
  } else {
    console.warn(`FIREBASE_ADMIN_SDK_PATH is set but file was not found at the provided path. Tried locations based on: ${process.env.FIREBASE_ADMIN_SDK_PATH}`);
  }
}

const admin = require('firebase-admin');

try {
  // Check if Firebase app is already initialized to avoid conflicts
  if (!admin.apps.length) {
    if (process.env.FIREBASE_ADMIN_SDK_PATH) {
      const sdkPath = findServiceAccountPath(process.env.FIREBASE_ADMIN_SDK_PATH);
      if (sdkPath) {
        try {
          const serviceAccount = require(sdkPath);
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: serviceAccount.project_id, // Explicitly set project ID
          });
          console.log('✅ Firebase Admin SDK initialized with service account credentials');
          console.log(`📍 Project ID: ${serviceAccount.project_id} (from ${sdkPath})`);

          // Initialize Firestore with explicit project ID
          const db = admin.firestore();
          db.settings({
            projectId: serviceAccount.project_id,
          });
          console.log('Connected to Firestore Database');
          module.exports = { admin, db };
          return; // Exit early to avoid creating db again below
        } catch (e) {
          console.error('Failed to initialize Firebase Admin using the service account at', sdkPath, e.message);
          // fall through to try GOOGLE_APPLICATION_CREDENTIALS or default ADC
        }
      } else {
        console.warn(`FIREBASE_ADMIN_SDK_PATH set but no accessible file found. Tried resolving possible locations based on: ${process.env.FIREBASE_ADMIN_SDK_PATH}`);
        // fall through to other initialization methods
      }
    }

    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // Let firebase-admin pick up the credentials from GOOGLE_APPLICATION_CREDENTIALS
      admin.initializeApp();
      console.log('✅ Firebase Admin SDK initialized with GOOGLE_APPLICATION_CREDENTIALS');
    } else {
      // Try to initialize with default credentials (useful on GCP or when ADC is available)
      console.warn('No explicit Firebase admin credentials provided. Calling initializeApp() and relying on default credentials.');
      admin.initializeApp();
    }
    
    // Create Firestore instance for other initialization methods
    const db = admin.firestore();
    console.log('Connected to Firestore Database');
    module.exports = { admin, db };
  } else {
    console.log('✅ Firebase Admin SDK already initialized');
    const db = admin.firestore();
    module.exports = { admin, db };
  }
} catch (err) {
  console.error('Failed to initialize Firebase Admin SDK:', err.message);
  // Don't try to initialize again in catch block as it can cause conflicts
  throw err; // Re-throw to prevent app from starting with broken Firebase
}
