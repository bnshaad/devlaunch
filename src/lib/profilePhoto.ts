import { auth } from "@/lib/firebase";

export const PROFILE_PHOTO_MAX_BYTES = 2 * 1024 * 1024;

const ALLOWED_PROFILE_PHOTO_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
} as const;

type AllowedProfilePhotoType = keyof typeof ALLOWED_PROFILE_PHOTO_TYPES;

type ProfilePhotoResult = {
  photoURL: string | null;
  photoPublicId: string | null;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Firebase did not return an error message.";
}

function logProfilePhotoDebug(message: string, details?: unknown) {
  if (process.env.NODE_ENV !== "production") {
    console.info(`[PROFILE PHOTO] ${message}`, details ?? "");
  }
}

async function getRequiredIdToken() {
  const currentUser = auth.currentUser;

  logProfilePhotoDebug("auth user exists", {
    hasUser: Boolean(currentUser),
    hasUid: Boolean(currentUser?.uid),
    userId: currentUser?.uid ?? null
  });

  if (!currentUser) {
    throw new Error("You must be signed in to manage your profile photo.");
  }

  try {
    return await currentUser.getIdToken();
  } catch (error) {
    throw new Error(`Auth token lookup failed: ${getErrorMessage(error)}`);
  }
}

function isAllowedProfilePhotoType(type: string): type is AllowedProfilePhotoType {
  return type in ALLOWED_PROFILE_PHOTO_TYPES;
}

function getProfilePhotoFileName(file: File) {
  if (!isAllowedProfilePhotoType(file.type)) {
    throw new Error("Profile photo must be a JPG, PNG, or WEBP image.");
  }

  return `avatar.${ALLOWED_PROFILE_PHOTO_TYPES[file.type]}`;
}

async function readProfilePhotoResponse(response: Response) {
  const data = (await response.json().catch(() => null)) as {
    error?: unknown;
    photoPublicId?: unknown;
    photoURL?: unknown;
  } | null;

  if (!response.ok) {
    throw new Error(
      typeof data?.error === "string"
        ? data.error
        : "Profile photo request failed. Please try again."
    );
  }

  return data;
}

export function validateProfilePhotoFile(file: File) {
  logProfilePhotoDebug("file validation", {
    name: file.name,
    size: file.size,
    type: file.type
  });

  if (!isAllowedProfilePhotoType(file.type)) {
    return "Choose a JPG, PNG, or WEBP image.";
  }

  if (file.size > PROFILE_PHOTO_MAX_BYTES) {
    return "Profile photo must be 2 MB or smaller.";
  }

  return null;
}

export async function uploadProfilePhoto(file: File): Promise<ProfilePhotoResult> {
  const token = await getRequiredIdToken();
  const validationError = validateProfilePhotoFile(file);

  if (validationError) {
    throw new Error(validationError);
  }

  const uploadFileName = getProfilePhotoFileName(file);
  const formData = new FormData();
  formData.append("file", file, uploadFileName);

  logProfilePhotoDebug("Cloudinary upload request start", {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    uploadFileName
  });

  let response: Response;

  try {
    response = await fetch("/api/profile-photo/upload", {
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`
      },
      method: "POST"
    });
  } catch (error) {
    console.error("[PROFILE PHOTO] Cloudinary upload request failed", error);
    throw new Error(`Profile photo upload failed: ${getErrorMessage(error)}`);
  }

  const data = await readProfilePhotoResponse(response);

  if (
    typeof data?.photoURL !== "string"
    || typeof data.photoPublicId !== "string"
  ) {
    throw new Error("Profile photo upload returned an invalid response.");
  }

  logProfilePhotoDebug("Cloudinary upload request success", {
    hasPhotoURL: Boolean(data.photoURL),
    photoPublicId: data.photoPublicId
  });

  return {
    photoPublicId: data.photoPublicId,
    photoURL: data.photoURL
  };
}

export async function removeProfilePhoto(
  currentPhotoPublicId?: string | null
): Promise<ProfilePhotoResult> {
  const token = await getRequiredIdToken();

  logProfilePhotoDebug("Cloudinary delete request start", {
    photoPublicId: currentPhotoPublicId ?? null
  });

  let response: Response;

  try {
    response = await fetch("/api/profile-photo/remove", {
      body: JSON.stringify({
        photoPublicId: currentPhotoPublicId ?? null
      }),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      method: "POST"
    });
  } catch (error) {
    console.error("[PROFILE PHOTO] Cloudinary delete request failed", error);
    throw new Error(`Profile photo removal failed: ${getErrorMessage(error)}`);
  }

  await readProfilePhotoResponse(response);
  logProfilePhotoDebug("Cloudinary delete request success");

  return { photoPublicId: null, photoURL: null };
}
