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

export const DEFAULT_DAILY_LIMIT = Number(process.env.AI_DAILY_LIMIT) || 20;
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
 * Checks if user is within their daily AI quota.
 * Does not increment the counter so failed requests are not penalized.
 */
export async function checkAiUsage(
  userId: string,
  dailyLimit = DEFAULT_DAILY_LIMIT
): Promise<{ allowed: boolean; remaining: number; resetHours: number; currentCount: number }> {
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
      resetHours,
      currentCount
    };
  }

  return {
    allowed: true,
    remaining: Math.max(0, dailyLimit - currentCount),
    resetHours,
    currentCount
  };
}

/**
 * Records successful AI usage for the user.
 */
export async function recordAiUsage(
  userId: string
): Promise<void> {
  const db = getFirebaseAdminDb();
  const rateLimitRef = db.doc(`aiRateLimits/${userId}`);

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  const snap = await rateLimitRef.get();
  const data = snap.data();
  const isToday = data?.lastDate === todayStr;

  await rateLimitRef.set(
    {
      count: isToday ? FieldValue.increment(1) : 1,
      lastDate: todayStr,
      updatedAt: FieldValue.serverTimestamp()
    },
    { merge: true }
  );
}

/**
 * Backward compatibility helper that checks and records in one step.
 */
export async function checkAndRecordAiUsage(
  userId: string,
  dailyLimit = DEFAULT_DAILY_LIMIT
): Promise<{ allowed: boolean; remaining: number; resetHours: number }> {
  const check = await checkAiUsage(userId, dailyLimit);
  if (!check.allowed) {
    return check;
  }
  await recordAiUsage(userId);
  return {
    allowed: true,
    remaining: Math.max(0, check.remaining - 1),
    resetHours: check.resetHours
  };
}
