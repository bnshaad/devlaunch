import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const REQUIRED_FIREBASE_ADMIN_ENV = [
  "FIREBASE_ADMIN_PROJECT_ID",
  "FIREBASE_ADMIN_CLIENT_EMAIL",
  "FIREBASE_ADMIN_PRIVATE_KEY"
] as const;

export class FirebaseAdminConfigError extends Error {
  constructor(missingKeys: string[]) {
    super(
      `Firebase Admin is not configured. Missing: ${missingKeys.join(
        ", "
      )}. Add these server-only values to .env.local, then restart the dev server.`
    );
    this.name = "FirebaseAdminConfigError";
  }
}

function getPrivateKey() {
  return process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
}

function getMissingFirebaseAdminEnv() {
  return REQUIRED_FIREBASE_ADMIN_ENV.filter((key) => !process.env[key]);
}

function getFirebaseAdminApp() {
  const existingApp = getApps()[0];

  if (existingApp) {
    return existingApp;
  }

  const missingKeys = getMissingFirebaseAdminEnv();

  if (missingKeys.length) {
    throw new FirebaseAdminConfigError([...missingKeys]);
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = getPrivateKey();

  if (!projectId || !clientEmail || !privateKey) {
    throw new FirebaseAdminConfigError([...REQUIRED_FIREBASE_ADMIN_ENV]);
  }

  if (!privateKey.includes("-----BEGIN PRIVATE KEY-----")) {
    throw new Error(
      "Firebase Admin private key is invalid. Copy FIREBASE_ADMIN_PRIVATE_KEY from the service account JSON and keep escaped newlines as \\n in .env.local."
    );
  }

  return initializeApp({
    credential: cert({
      clientEmail,
      privateKey,
      projectId
    }),
    projectId
  });
}

export function getFirebaseAdminAuth() {
  return getAuth(getFirebaseAdminApp());
}

export function getFirebaseAdminDb() {
  return getFirestore(getFirebaseAdminApp());
}
