import { FieldValue } from "firebase-admin/firestore";
import { NextResponse, type NextRequest } from "next/server";
import {
  deleteProfilePhotoFromCloudinary,
  isOwnProfilePhotoPublicId
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
    : "Unable to remove profile photo.";

  console.error("[PROFILE PHOTO API] remove failed", error);

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
      { error: "You must be signed in to remove a profile photo." },
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

    const body = (await request.json().catch(() => ({}))) as {
      photoPublicId?: unknown;
    };
    const photoPublicId =
      typeof body.photoPublicId === "string" ? body.photoPublicId : null;

    if (photoPublicId) {
      if (!isOwnProfilePhotoPublicId(decodedToken.uid, photoPublicId)) {
        return NextResponse.json(
          { error: "This profile photo does not belong to the signed-in user." },
          { status: 403 }
        );
      }

      console.info("[PROFILE PHOTO API] delete start", {
        photoPublicId,
        uid: decodedToken.uid
      });
      await deleteProfilePhotoFromCloudinary(photoPublicId);
    }

    await getFirebaseAdminDb()
      .doc(`users/${decodedToken.uid}`)
      .set(
        {
          photoPublicId: null,
          photoURL: null,
          photoUpdatedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp()
        },
        { merge: true }
      );

    console.info("[PROFILE PHOTO API] remove success", {
      hadPhotoPublicId: Boolean(photoPublicId),
      uid: decodedToken.uid
    });

    return NextResponse.json({
      photoPublicId: null,
      photoURL: null
    });
  } catch (error) {
    return errorResponse(error);
  }
}
