import { FieldValue } from "firebase-admin/firestore";
import { NextResponse, type NextRequest } from "next/server";
import {
  getProfilePhotoPublicId,
  uploadProfilePhotoToCloudinary,
  validateServerProfilePhotoFile
} from "@/lib/cloudinary";
import {
  FirebaseAdminConfigError,
  getFirebaseAdminAuth,
  getFirebaseAdminDb
} from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

function getBearerToken(request: NextRequest) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length).trim();
}

function errorResponse(error: unknown, status = 500) {
  const message = error instanceof Error
    ? error.message
    : "Unable to upload profile photo.";

  console.error("[PROFILE PHOTO API] upload failed", error);

  return NextResponse.json({ error: message }, { status });
}

function getAuthErrorCode(error: unknown) {
  if (typeof error === "object" && error && "code" in error) {
    const code = (error as { code?: unknown }).code;

    return typeof code === "string" ? code : null;
  }

  return null;
}

export async function POST(request: NextRequest) {
  const token = getBearerToken(request);

  if (!token) {
    return NextResponse.json(
      { error: "You must be signed in to upload a profile photo." },
      { status: 401 }
    );
  }

  try {
    let decodedToken;

    try {
      decodedToken = await getFirebaseAdminAuth().verifyIdToken(token);
    } catch (error) {
      if (error instanceof FirebaseAdminConfigError) {
        return errorResponse(error);
      }

      console.error("[PROFILE PHOTO API] token verification failed", {
        code: getAuthErrorCode(error),
        error
      });

      return NextResponse.json(
        { error: "Your session could not be verified. Please sign in again." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Choose an image before uploading." },
        { status: 400 }
      );
    }

    const validationError = validateServerProfilePhotoFile(file);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const expectedPublicId = getProfilePhotoPublicId(decodedToken.uid);

    console.info("[PROFILE PHOTO API] upload start", {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      publicId: expectedPublicId,
      uid: decodedToken.uid
    });

    const result = await uploadProfilePhotoToCloudinary(decodedToken.uid, file);

    if (result.publicId !== expectedPublicId) {
      throw new Error("Cloudinary returned an unexpected public id.");
    }

    await getFirebaseAdminDb()
      .doc(`users/${decodedToken.uid}`)
      .set(
        {
          photoPublicId: result.publicId,
          photoURL: result.secureUrl,
          photoUpdatedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp()
        },
        { merge: true }
      );

    console.info("[PROFILE PHOTO API] upload success", {
      publicId: result.publicId,
      uid: decodedToken.uid
    });

    return NextResponse.json({
      photoPublicId: result.publicId,
      photoURL: result.secureUrl,
      public_id: result.publicId,
      secure_url: result.secureUrl
    });
  } catch (error) {
    return errorResponse(error);
  }
}
