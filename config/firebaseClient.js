// Client (web) Firebase configuration
// This is the Firebase config used by the Firebase JS SDK in web/mobile clients.
// Keep this separate from the server-side `firebase-admin` service account usage.

const firebaseConfig = {
  apiKey: "AIzaSyAineO6DuMBwGM2v6jqfViB42hWNKEjfns",
  authDomain: "baked-blissed.firebaseapp.com",
  projectId: "baked-blissed",
  storageBucket: "baked-blissed.firebasestorage.app",
  messagingSenderId: "141946842391",
  appId: "1:141946842391:web:ac6fa94201bea3ceba5b52",
  measurementId: "G-9KPWSE473W"
};

module.exports = firebaseConfig;

/*
Usage (frontend):
  import { initializeApp } from 'firebase/app';
  import { getAuth } from 'firebase/auth';
  const firebaseConfig = require('./config/firebaseClient');
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

Notes:
 - Do NOT use the web SDK on the server for admin tasks (use firebase-admin and a service account).
 - If you plan to host any frontend code in this repo, you can import this file for initialization.
 - Keep service account JSON out of version control. Use environment variables like
   FIREBASE_ADMIN_SDK_PATH or GOOGLE_APPLICATION_CREDENTIALS for the server admin SDK.
*/
