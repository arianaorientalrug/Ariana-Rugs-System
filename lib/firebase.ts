/**
 * FIREBASE CONFIGURATION
 * 
 * Cloud database for syncing invoices across all devices
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

// Firebase configuration - hardcoded for static export compatibility
// These values are safe to expose publicly (they're client-side credentials)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAuM8kZPTSFIIDk0pWHUN0dgOk56z6SXP0",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "ariana-oriental-rugs.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "ariana-oriental-rugs",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "ariana-oriental-rugs.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "239473809179",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:239473809179:web:c9c671d74c55822cf325be"
};

/**
 * Check if Firebase is configured
 */
export function isFirebaseConfigured(): boolean {
  const hasConfig = !!(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.apiKey !== ''
  );

  console.log('Firebase configured:', hasConfig);
  console.log('Firebase config:', {
    hasApiKey: !!firebaseConfig.apiKey,
    hasProjectId: !!firebaseConfig.projectId,
    projectId: firebaseConfig.projectId
  });

  return hasConfig;
}

// Initialize Firebase only if configured

let app: FirebaseApp;
let db: Firestore | undefined;

try {
  if (isFirebaseConfigured() && typeof window !== 'undefined') {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    db = getFirestore(app);
    console.log('Firebase initialized successfully');
  } else {
    // For SSR or if not configured, initialize a dummy app (for type safety)
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    console.log('Firebase not configured - using localStorage only');
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
}

export { app };

export { db };

/**
 * Global Error Handler for Firebase Quota Exhaustion
 * Call this inside try/catch blocks making Firebase requests to alert the user if the database is full.
 */
export function checkFirebaseQuotaError(error: any) {
  if (!error) return;

  const errorString = (error.message || error.code || error.toString()).toLowerCase();

  // Firebase specific quota exceeded / resource exhausted errors
  if (
    errorString.includes('quota-exceeded') ||
    errorString.includes('quota exceeded') ||
    errorString.includes('resource-exhausted') ||
    errorString.includes('resource exhausted') ||
    error.code === 'resource-exhausted'
  ) {
    const alertMessage = "CRITICAL ALARM: Your Firebase Database is full or has exceeded its quota limits! Please upgrade your Firebase plan immediately to continue saving and loading invoices.";
    console.error(alertMessage, error);

    // Alert the user on the client side
    if (typeof window !== 'undefined') {
      alert(alertMessage);
    }

    return true;
  }

  return false;
}
