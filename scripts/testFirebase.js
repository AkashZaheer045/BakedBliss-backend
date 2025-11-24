// Quick smoke test for Firebase Admin connectivity
// Usage: set FIREBASE_ADMIN_SDK_PATH env var (or configure .env) then run:
//   node scripts/testFirebase.js

require('dotenv').config();
const { db } = require('../config/firebaseConfig');

(async () => {
  try {
    const ref = db.collection('healthCheck').doc();
    await ref.set({ time: new Date().toISOString(), source: 'smoke-test' });
    console.log('Wrote healthCheck doc id:', ref.id);

    const snap = await db.collection('healthCheck').orderBy('time', 'desc').limit(1).get();
    console.log('Read back docs count:', snap.size);
    snap.forEach(d => console.log('Doc:', d.id, d.data()));
    process.exit(0);
  } catch (err) {
    console.error('Firestore test failed:', err);
    process.exit(2);
  }
})();
