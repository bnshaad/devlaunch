import { GoogleGenAI } from "@google/genai";
import { FieldValue } from "firebase-admin/firestore";
import { getFirebaseAdminDb } from "@/lib/firebaseAdmin";

export class AiConfigError extends Error {
  constructor(
    message = "Google Gemini API is not configured. Add GEMINI_API_KEY to your .env.local file. You can get a free API key at https://aistudio.google.com"
  ) {
    super(message);
    this.name = "AiConfigError";
  }
}

export class AiRateLimitError extends Error {
  public remaining: number;
  public resetTime: string;

  constructor(message: string, remaining = 0, resetTime = "") {
    super(message);
    this.name = "AiRateLimitError";
    this.remaining = remaining;
    this.resetTime = resetTime;
  }
}

const DEFAULT_DAILY_LIMIT = 5;
export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";
export const GEMINI_FALLBACK_MODELS = [
  GEMINI_MODEL,
  "gemini-flash-latest",
  "gemini-3.5-flash"
];

let cachedGeminiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new AiConfigError();
  }

  if (!cachedGeminiClient) {
    cachedGeminiClient = new GoogleGenAI({ apiKey });
  }

  return cachedGeminiClient;
}

/**
 * Checks and records user AI usage using Firebase Admin Firestore.
 * Conforms to the Firebase Spark (free) plan with minimal reads/writes.
 */
export async function checkAndRecordAiUsage(
  userId: string,
  dailyLimit = DEFAULT_DAILY_LIMIT
): Promise<{ allowed: boolean; remaining: number; resetHours: number }> {
  const db = getFirebaseAdminDb();
  const rateLimitRef = db.doc(`aiRateLimits/${userId}`);

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
  const tomorrowUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  const resetHours = Math.max(1, Math.ceil((tomorrowUtc.getTime() - now.getTime()) / (1000 * 60 * 60)));

  const snap = await rateLimitRef.get();
  const data = snap.data();

  const isToday = data?.lastDate === todayStr;
  const currentCount = isToday ? (Number(data?.count) || 0) : 0;

  if (currentCount >= dailyLimit) {
    return {
      allowed: false,
      remaining: 0,
      resetHours
    };
  }

  // Atomically record or reset today's usage
  await rateLimitRef.set(
    {
      count: isToday ? FieldValue.increment(1) : 1,
      lastDate: todayStr,
      updatedAt: FieldValue.serverTimestamp()
    },
    { merge: true }
  );

  return {
    allowed: true,
    remaining: Math.max(0, dailyLimit - (currentCount + 1)),
    resetHours
  };
}
