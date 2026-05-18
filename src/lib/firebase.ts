import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseEnv = {
  NEXT_PUBLIC_FIREBASE_API_KEY:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  NEXT_PUBLIC_FIREBASE_PROJECT_ID:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? ""
};

const firebaseConfig = {
  apiKey: firebaseEnv.NEXT_PUBLIC_FIREBASE_API_KEY || "missing-api-key",
  authDomain:
    firebaseEnv.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "missing-auth-domain.firebaseapp.com",
  projectId: firebaseEnv.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "missing-project-id",
  storageBucket:
    firebaseEnv.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "missing-project-id.appspot.com",
  messagingSenderId:
    firebaseEnv.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId: firebaseEnv.NEXT_PUBLIC_FIREBASE_APP_ID || "1:000000000000:web:missing"
};

const missingFirebaseEnv = Object.entries(firebaseEnv)
  .filter(([, value]) => !value)
  .map(([key]) => key);

export const isFirebaseConfigured = missingFirebaseEnv.length === 0;
export const firebasePublicConfigStatus = {
  configured: isFirebaseConfigured,
  missingKeys: missingFirebaseEnv,
  authDomain: firebaseConfig.authDomain || null,
  projectId: firebaseConfig.projectId || null
};

function logAuthDebug(message: string, details?: unknown) {
  if (process.env.NODE_ENV !== "production") {
    console.info(`[AUTH DEBUG] ${message}`, details ?? "");
  }
}

if (!isFirebaseConfigured) {
  console.error(
    `Firebase is missing required public environment variables: ${missingFirebaseEnv.join(
      ", "
    )}. Add the NEXT_PUBLIC_FIREBASE_* variables before using authentication.`
  );
}

function getFirebaseApp() {
  const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

  if (isFirebaseConfigured) {
    logAuthDebug("Firebase app initialized", {
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId
    });
  }

  return firebaseApp;
}

export const app = getFirebaseApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
