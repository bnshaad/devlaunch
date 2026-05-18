import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes
} from "firebase/storage";
import { auth, db, storage } from "@/lib/firebase";

export const PROFILE_PHOTO_MAX_BYTES = 2 * 1024 * 1024;

const ALLOWED_PROFILE_PHOTO_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
} as const;

type AllowedProfilePhotoType = keyof typeof ALLOWED_PROFILE_PHOTO_TYPES;

type ProfilePhotoResult = {
  photoURL: string | null;
  photoPath: string | null;
};

function getErrorCode(error: unknown) {
  if (typeof error === "object" && error && "code" in error) {
    const code = (error as { code?: unknown }).code;

    return typeof code === "string" ? code : null;
  }

  return null;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Firebase did not return an error message.";
}

function formatFirebaseStepError(step: string, error: unknown) {
  const code = getErrorCode(error);
  const message = getErrorMessage(error);

  return `${step} failed${code ? ` (${code})` : ""}: ${message}`;
}

function getCurrentUserId() {
  const userId = auth.currentUser?.uid;

  if (!userId) {
    throw new Error("You must be signed in to manage your profile photo.");
  }

  return userId;
}

function isAllowedProfilePhotoType(type: string): type is AllowedProfilePhotoType {
  return type in ALLOWED_PROFILE_PHOTO_TYPES;
}

function getProfilePhotoPath(userId: string, file: File) {
  if (!isAllowedProfilePhotoType(file.type)) {
    throw new Error("Profile photo must be a JPG, PNG, or WEBP image.");
  }

  return `users/${userId}/profile/avatar.${ALLOWED_PROFILE_PHOTO_TYPES[file.type]}`;
}

function isOwnProfilePhotoPath(userId: string, path: string) {
  return /^users\/[^/]+\/profile\/avatar\.(jpg|png|webp)$/.test(path)
    && path.startsWith(`users/${userId}/profile/`);
}

async function deleteExistingPhoto(path: string | null | undefined) {
  if (!path) {
    return;
  }

  await deleteObject(ref(storage, path));
}

async function saveProfilePhotoMetadata(
  userId: string,
  photoURL: string | null,
  photoPath: string | null
) {
  const userRef = doc(db, "users", userId);
  const userSnapshot = await getDoc(userRef);
  const timestamp = serverTimestamp();
  const photoFields = {
    photoURL,
    photoPath,
    photoUpdatedAt: timestamp,
    updatedAt: timestamp
  };

  if (userSnapshot.exists()) {
    await setDoc(userRef, photoFields, { merge: true });
    return;
  }

  const currentUser = auth.currentUser;

  await setDoc(
    userRef,
    {
      uid: userId,
      email: currentUser?.email ?? null,
      displayName: currentUser?.displayName ?? null,
      username: null,
      createdAt: timestamp,
      ...photoFields
    },
    { merge: true }
  );
}

export function validateProfilePhotoFile(file: File) {
  if (!isAllowedProfilePhotoType(file.type)) {
    return "Choose a JPG, PNG, or WEBP image.";
  }

  if (file.size > PROFILE_PHOTO_MAX_BYTES) {
    return "Profile photo must be 2 MB or smaller.";
  }

  return null;
}

export async function uploadProfilePhoto(
  file: File,
  previousPhotoPath?: string | null
): Promise<ProfilePhotoResult> {
  const validationError = validateProfilePhotoFile(file);

  if (validationError) {
    throw new Error(validationError);
  }

  const userId = getCurrentUserId();
  const photoPath = getProfilePhotoPath(userId, file);
  const photoRef = ref(storage, photoPath);
  let uploaded = false;
  let photoURL: string;

  try {
    await uploadBytes(photoRef, file, {
      contentType: file.type,
      customMetadata: {
        owner: userId
      }
    });
    uploaded = true;
  } catch (error) {
    throw new Error(formatFirebaseStepError("Storage upload", error));
  }

  try {
    photoURL = await getDownloadURL(photoRef);
  } catch (error) {
    await deleteExistingPhoto(photoPath).catch((cleanupError) => {
      console.warn("Unable to clean up profile photo after URL failure:", cleanupError);
    });

    throw new Error(formatFirebaseStepError("Download URL lookup", error));
  }

  try {
    await saveProfilePhotoMetadata(userId, photoURL, photoPath);
  } catch (error) {
    if (uploaded) {
      await deleteExistingPhoto(photoPath).catch((cleanupError) => {
        console.warn("Unable to clean up failed profile photo upload:", cleanupError);
      });
    }

    throw new Error(formatFirebaseStepError("Firestore profile update", error));
  }

  if (
    previousPhotoPath &&
    previousPhotoPath !== photoPath &&
    isOwnProfilePhotoPath(userId, previousPhotoPath)
  ) {
    deleteExistingPhoto(previousPhotoPath).catch((error) => {
      console.warn("Unable to delete previous profile photo:", error);
    });
  }

  return { photoURL, photoPath };
}

export async function removeProfilePhoto(
  currentPhotoPath?: string | null
): Promise<ProfilePhotoResult> {
  const userId = getCurrentUserId();

  if (currentPhotoPath) {
    if (!isOwnProfilePhotoPath(userId, currentPhotoPath)) {
      throw new Error("This profile photo does not belong to the signed-in user.");
    }

    await deleteExistingPhoto(currentPhotoPath);
  }

  try {
    await saveProfilePhotoMetadata(userId, null, null);
  } catch (error) {
    throw new Error(formatFirebaseStepError("Firestore profile update", error));
  }

  return { photoURL: null, photoPath: null };
}
