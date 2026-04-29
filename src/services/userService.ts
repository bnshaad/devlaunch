import { type User as FirebaseUser } from "firebase/auth";
import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  setDoc,
  type DocumentData,
  type Timestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { type AppUser } from "@/types/user";

const USERNAME_PATTERN = /^[a-z0-9_-]{3,20}$/;

function toAppUser(data: DocumentData): AppUser {
  return {
    uid: data.uid,
    email: data.email ?? null,
    displayName: data.displayName ?? null,
    photoURL: data.photoURL ?? null,
    username: data.username ?? null,
    createdAt: data.createdAt as Timestamp | undefined,
    updatedAt: data.updatedAt as Timestamp | undefined
  };
}

export function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

export function validateUsername(username: string) {
  const normalizedUsername = normalizeUsername(username);

  if (!normalizedUsername) {
    return "Username is required.";
  }

  if (normalizedUsername.length < 3) {
    return "Username must be at least 3 characters.";
  }

  if (normalizedUsername.length > 20) {
    return "Username must be 20 characters or fewer.";
  }

  if (!USERNAME_PATTERN.test(normalizedUsername)) {
    return "Use lowercase letters, numbers, hyphens, and underscores only.";
  }

  return null;
}

export async function createUserIfNotExists(firebaseUser: FirebaseUser) {
  const userRef = doc(db, "users", firebaseUser.uid);
  const userSnapshot = await getDoc(userRef);

  if (userSnapshot.exists()) {
    return toAppUser(userSnapshot.data());
  }

  const newUser = {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    username: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  await setDoc(userRef, newUser);

  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    username: null
  } satisfies AppUser;
}

export async function getUserProfile(uid: string) {
  const userSnapshot = await getDoc(doc(db, "users", uid));

  if (!userSnapshot.exists()) {
    return null;
  }

  return toAppUser(userSnapshot.data());
}

export async function checkUsernameAvailable(username: string) {
  const normalizedUsername = normalizeUsername(username);
  const usernameSnapshot = await getDoc(doc(db, "usernames", normalizedUsername));

  return !usernameSnapshot.exists();
}

export async function claimUsername(uid: string, username: string) {
  const normalizedUsername = normalizeUsername(username);
  const validationError = validateUsername(normalizedUsername);

  if (validationError) {
    throw new Error(validationError);
  }

  const userRef = doc(db, "users", uid);
  const usernameRef = doc(db, "usernames", normalizedUsername);

  await runTransaction(db, async (transaction) => {
    const usernameSnapshot = await transaction.get(usernameRef);

    if (usernameSnapshot.exists()) {
      throw new Error("That username is already taken.");
    }

    const userSnapshot = await transaction.get(userRef);

    if (!userSnapshot.exists()) {
      throw new Error("User profile was not found. Please sign in again.");
    }

    const userData = userSnapshot.data();

    if (userData.username) {
      throw new Error("This account already has a username.");
    }

    transaction.set(usernameRef, {
      uid,
      createdAt: serverTimestamp()
    });

    transaction.update(userRef, {
      username: normalizedUsername,
      updatedAt: serverTimestamp()
    });
  });

  const updatedProfile = await getUserProfile(uid);

  if (!updatedProfile) {
    throw new Error("Unable to load the updated user profile.");
  }

  return updatedProfile;
}
