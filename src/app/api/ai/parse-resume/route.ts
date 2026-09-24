import { NextResponse, type NextRequest } from "next/server";
import {
  AiConfigError,
  checkAndRecordAiUsage,
  getGeminiClient,
  GEMINI_FALLBACK_MODELS
} from "@/lib/gemini";
import {
  aiResumeOutputSchema,
  geminiResumeResponseSchema
} from "@/lib/aiResumeSchema";
import {
  FirebaseAdminConfigError,
  getFirebaseAdminAuth
} from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
const PDF_MAGIC_BYTES = "%PDF-";

function getBearerToken(request: NextRequest): string | null {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }
  return authorization.slice("Bearer ".length).trim();
}

function isPdfBuffer(buffer: Buffer): boolean {
  if (buffer.length < 5) return false;
  return buffer.toString("utf8", 0, 5) === PDF_MAGIC_BYTES;
}

export async function POST(request: NextRequest) {
  const token = getBearerToken(request);

  if (!token) {
    return NextResponse.json(
      { error: "You must be signed in to use the AI resume parser." },
      { status: 401 }
    );
  }

  let decodedToken;
  try {
    decodedToken = await getFirebaseAdminAuth().verifyIdToken(token);
  } catch (error) {
    if (error instanceof FirebaseAdminConfigError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    console.error("[AI RESUME API] Token verification failed:", error);
    return NextResponse.json(
      { error: "Your session could not be verified. Please sign in again." },
      { status: 401 }
    );
  }

  // Enforce lightweight Firebase Spark rate limit (5 parses per user per day)
  try {
    const usage = await checkAndRecordAiUsage(decodedToken.uid);
    if (!usage.allowed) {
      return NextResponse.json(
        {
          error: `You have reached the daily limit of 5 AI resume imports. Quota resets in ${usage.resetHours} hour(s).`
        },
        { status: 429 }
      );
    }
  } catch (error) {
    console.error("[AI RESUME API] Rate limit check error:", error);
    // Don't completely block user if Firestore admin has temporary issue, log and continue
  }

  // Parse input: either multipart/form-data (PDF) or application/json (raw text)
  const contentType = request.headers.get("content-type") || "";
  let contentsPayload: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

  try {
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file");

      if (!(file instanceof File)) {
        return NextResponse.json(
          { error: "Please upload a resume file (PDF or text)." },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "File exceeds 4MB limit. Please upload a smaller resume or paste text." },
          { status: 413 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
        if (!isPdfBuffer(buffer)) {
          return NextResponse.json(
            { error: "The uploaded file does not appear to be a valid PDF document." },
            { status: 400 }
          );
        }

        const base64Data = buffer.toString("base64");
        contentsPayload = [
          {
            inlineData: {
              mimeType: "application/pdf",
              data: base64Data
            }
          },
          {
            text: `Analyze this resume/CV document carefully. Extract the candidate's name, craft a punchy developer headline (3-100 chars), write a compelling professional bio (first-person or third-person, under 500 chars), find their location, contact email, GitHub, LinkedIn, and personal website URLs. Normalize and extract their top technical skills (up to 20 tags). Extract any personal, open-source, or highlighted software engineering projects with clear titles, descriptions, and tech stacks.`
          }
        ];
      } else {
        // Plain text file
        const textContent = buffer.toString("utf8");
        if (textContent.trim().length < 30) {
          return NextResponse.json(
            { error: "The uploaded text file does not contain enough text to extract a portfolio." },
            { status: 400 }
          );
        }

        contentsPayload = [
          {
            text: `Analyze this resume/CV text:\n\n${textContent}\n\nExtract the candidate's developer portfolio details and projects according to the schema.`
          }
        ];
      }
    } else if (contentType.includes("application/json")) {
      const body = await request.json();
      const text = typeof body?.text === "string" ? body.text.trim() : "";

      if (text.length < 30) {
        return NextResponse.json(
          { error: "Please provide at least 30 characters of resume text." },
          { status: 400 }
        );
      }

      if (text.length > 40000) {
        return NextResponse.json(
          { error: "Pasted text is too long. Please shorten to under 40,000 characters." },
          { status: 400 }
        );
      }

      contentsPayload = [
        {
          text: `Analyze this developer resume text:\n\n${text}\n\nExtract the candidate's developer portfolio details and projects according to the schema.`
        }
      ];
    } else {
      return NextResponse.json(
        { error: "Unsupported Content-Type. Please upload a PDF file or send JSON text." },
        { status: 400 }
      );
    }

    // Call Google Gemini with fallback model resilience
    const ai = getGeminiClient();
    let rawOutput: string | undefined;
    let lastError: unknown;

    for (const modelName of GEMINI_FALLBACK_MODELS) {
      try {
        console.info(`[AI RESUME API] Calling Gemini model: ${modelName}`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: contentsPayload,
          config: {
            responseMimeType: "application/json",
            responseSchema: geminiResumeResponseSchema,
            temperature: 0.2
          }
        });

        const text = response.text?.trim();
        if (text) {
          rawOutput = text;
          break; // successfully got response
        }
      } catch (err) {
        lastError = err;
        console.warn(`[AI RESUME API] Model ${modelName} failed, trying next candidate if available:`, err);
      }
    }

    if (!rawOutput) {
      throw lastError || new Error("Gemini returned an empty response.");
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(rawOutput);
    } catch (parseError) {
      console.error("[AI RESUME API] Failed to parse Gemini response as JSON:", rawOutput, parseError);
      throw new Error("Unable to parse structured data from the resume. Please try again.");
    }

    // Defensively validate and sanitize with Zod
    const validatedOutput = aiResumeOutputSchema.parse(parsedJson);

    return NextResponse.json({
      success: true,
      data: validatedOutput
    });
  } catch (error) {
    if (error instanceof AiConfigError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }

    let message = error instanceof Error ? error.message : "Unable to parse resume.";
    console.error("[AI RESUME API] Processing failed:", error);

    // If error.message is stringified JSON from Google API, extract the clean message
    try {
      const parsed = JSON.parse(message);
      if (parsed?.error?.message) {
        message = parsed.error.message;
      }
    } catch {
      // not JSON, keep as is
    }

    // Detect rate limit or temporary capacity errors from Gemini
    if (
      message.includes("429") ||
      message.toLowerCase().includes("quota") ||
      message.toLowerCase().includes("rate limit") ||
      message.toLowerCase().includes("high demand")
    ) {
      return NextResponse.json(
        {
          error: "The AI service is experiencing high traffic right now. Please wait a moment and try again, or paste your text directly."
        },
        { status: 429 }
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
