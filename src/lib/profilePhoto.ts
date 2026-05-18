import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
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

  try {
    await uploadBytes(photoRef, file, {
      contentType: file.type,
      customMetadata: {
        owner: userId
      }
    });

    const photoURL = await getDownloadURL(photoRef);

    await updateDoc(doc(db, "users", userId), {
      photoURL,
      photoPath,
      photoUpdatedAt: serverTimestamp()
    });

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
  } catch (error) {
    await deleteExistingPhoto(photoPath).catch((cleanupError) => {
      console.warn("Unable to clean up failed profile photo upload:", cleanupError);
    });

    throw error;
  }
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

  await updateDoc(doc(db, "users", userId), {
    photoURL: null,
    photoPath: null,
    photoUpdatedAt: serverTimestamp()
  });

  return { photoURL: null, photoPath: null };
}
