import { auth } from "@/lib/firebase";
import { type AiResumeOutput } from "@/lib/aiResumeSchema";

export type ParseResumeOptions = {
  file?: File | null;
  text?: string;
};

export async function parseResumeWithAi(
  options: ParseResumeOptions
): Promise<AiResumeOutput> {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("You must be signed in to use the AI resume parser.");
  }

  const token = await currentUser.getIdToken();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000); // 35s timeout

  try {
    let response: Response;

    if (options.file) {
      const formData = new FormData();
      formData.append("file", options.file);

      response = await fetch("/api/ai/parse-resume", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData,
        signal: controller.signal
      });
    } else if (options.text) {
      response = await fetch("/api/ai/parse-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text: options.text }),
        signal: controller.signal
      });
    } else {
      throw new Error("Please select a resume file or enter resume text.");
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage =
        data?.error ||
        (response.status === 413
          ? "File size exceeds server limit. Please upload a smaller file."
          : response.status === 429
          ? "AI service is currently busy or daily limit reached. Please try again later."
          : response.status === 503
          ? "AI service is not configured on the server. Please check environment variables."
          : `Failed to parse resume (HTTP ${response.status}).`);
      throw new Error(errorMessage);
    }

    if (!data?.success || !data?.data) {
      throw new Error("Invalid response format received from AI parser.");
    }

    return data.data as AiResumeOutput;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(
        "Resume processing took too long to complete. Please try again or paste your resume text."
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
