import { createHash } from "crypto";

export const CLOUDINARY_PROFILE_PHOTO_FOLDER = "devlaunch/profile-photos";
export const CLOUDINARY_PROFILE_PHOTO_MAX_BYTES = 2 * 1024 * 1024;

const ALLOWED_PROFILE_PHOTO_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp"
]);

type CloudinaryUploadResponse = {
  public_id?: string;
  secure_url?: string;
};

type CloudinaryDeleteResponse = {
  result?: string;
};

function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
    );
  }

  return { apiKey, apiSecret, cloudName };
}

function signCloudinaryParams(
  params: Record<string, string | number>,
  apiSecret: string
) {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return createHash("sha1")
    .update(`${payload}${apiSecret}`)
    .digest("hex");
}

async function parseCloudinaryResponse(response: Response) {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof data?.error?.message === "string"
        ? data.error.message
        : "Cloudinary request failed.";

    throw new Error(message);
  }

  return data;
}

export function validateServerProfilePhotoFile(file: File) {
  if (!ALLOWED_PROFILE_PHOTO_TYPES.has(file.type)) {
    return "Choose a JPG, PNG, or WEBP image.";
  }

  if (file.size > CLOUDINARY_PROFILE_PHOTO_MAX_BYTES) {
    return "Profile photo must be 2 MB or smaller.";
  }

  return null;
}

export function getProfilePhotoPublicId(uid: string) {
  return `${CLOUDINARY_PROFILE_PHOTO_FOLDER}/${uid}/avatar`;
}

export function isOwnProfilePhotoPublicId(uid: string, publicId: string) {
  return publicId === getProfilePhotoPublicId(uid);
}

export async function uploadProfilePhotoToCloudinary(uid: string, file: File) {
  const { apiKey, apiSecret, cloudName } = getCloudinaryConfig();
  const publicId = getProfilePhotoPublicId(uid);
  const timestamp = Math.floor(Date.now() / 1000);
  const params = {
    invalidate: "true",
    overwrite: "true",
    public_id: publicId,
    timestamp
  };
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("invalidate", params.invalidate);
  formData.append("overwrite", params.overwrite);
  formData.append("public_id", params.public_id);
  formData.append("timestamp", String(params.timestamp));
  formData.append("signature", signCloudinaryParams(params, apiSecret));

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      body: formData,
      method: "POST"
    }
  );
  const data = (await parseCloudinaryResponse(response)) as CloudinaryUploadResponse;

  if (!data.secure_url || !data.public_id) {
    throw new Error("Cloudinary upload returned an invalid response.");
  }

  return {
    publicId: data.public_id,
    secureUrl: data.secure_url
  };
}

export async function deleteProfilePhotoFromCloudinary(publicId: string) {
  const { apiKey, apiSecret, cloudName } = getCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const params = {
    invalidate: "true",
    public_id: publicId,
    timestamp
  };
  const formData = new FormData();
  formData.append("api_key", apiKey);
  formData.append("invalidate", params.invalidate);
  formData.append("public_id", params.public_id);
  formData.append("timestamp", String(params.timestamp));
  formData.append("signature", signCloudinaryParams(params, apiSecret));

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
    {
      body: formData,
      method: "POST"
    }
  );
  const data = (await parseCloudinaryResponse(response)) as CloudinaryDeleteResponse;

  if (data.result === "error") {
    throw new Error("Cloudinary could not delete the profile photo.");
  }
}
