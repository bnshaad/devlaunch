import { Type, type Schema } from "@google/genai";
import { z } from "zod";
import { normalizeSkills } from "@/lib/skills";
import { type PortfolioInput } from "@/types/portfolio";
import { type ProjectInput } from "@/types/project";

/**
 * Strips markdown, quotes, whitespace, and guarantees a valid http(s) URL.
 * Automatically adds https:// if domain-like string is provided without scheme.
 */
export function sanitizeUrl(value?: string | null): string {
  if (!value) {
    return "";
  }

  let cleaned = value.trim();

  // Strip markdown link format [text](url) -> url
  const markdownMatch = cleaned.match(/\[.*?\]\((https?:\/\/[^\s)]+)\)/);
  if (markdownMatch?.[1]) {
    cleaned = markdownMatch[1];
  }

  // Strip wrapping quotes or angle brackets
  cleaned = cleaned.replace(/^["'`<]+|["'`>]+$/g, "").trim();

  if (!cleaned) {
    return "";
  }

  // If user provided github.com/user or linkedin.com/in/user without scheme
  if (!/^https?:\/\//i.test(cleaned)) {
    if (
      cleaned.startsWith("github.com") ||
      cleaned.startsWith("linkedin.com") ||
      cleaned.startsWith("www.") ||
      /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(cleaned)
    ) {
      cleaned = `https://${cleaned}`;
    }
  }

  try {
    const parsed = new URL(cleaned);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
    return "";
  } catch {
    return "";
  }
}

/**
 * Trims and clamps a string to maximum allowed length.
 */
export function clampString(value: string | null | undefined, maxLength: number): string {
  if (!value) {
    return "";
  }
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  return trimmed.slice(0, maxLength).trim();
}

/**
 * Zod schema for defensive validation of AI portfolio output.
 */
export const aiPortfolioSchema = z.object({
  fullName: z
    .string()
    .nullish()
    .transform((val) => clampString(val, 80)),
  headline: z
    .string()
    .nullish()
    .transform((val) => {
      const clamped = clampString(val, 100);
      return clamped.length >= 3 ? clamped : "Software Engineer";
    }),
  bio: z
    .string()
    .nullish()
    .transform((val) => clampString(val, 500)),
  location: z
    .string()
    .nullish()
    .transform((val) => clampString(val, 80)),
  email: z
    .string()
    .nullish()
    .transform((val) => {
      const trimmed = (val ?? "").trim();
      if (!trimmed) return "";
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
      return isEmail ? trimmed : "";
    }),
  githubUrl: z
    .string()
    .nullish()
    .transform(sanitizeUrl),
  linkedinUrl: z
    .string()
    .nullish()
    .transform(sanitizeUrl),
  websiteUrl: z
    .string()
    .nullish()
    .transform(sanitizeUrl),
  skills: z
    .array(z.string())
    .nullish()
    .transform((val) => normalizeSkills(val ?? [])),
  isPublic: z
    .boolean()
    .nullish()
    .transform(() => false)
});

/**
 * Zod schema for defensive validation of extracted projects.
 */
export const aiProjectSchema = z.object({
  title: z
    .string()
    .nullish()
    .transform((val) => {
      const clamped = clampString(val, 80);
      return clamped.length >= 3 ? clamped : "Portfolio Project";
    }),
  description: z
    .string()
    .nullish()
    .transform((val) => {
      const clamped = clampString(val, 400);
      return clamped.length >= 10
        ? clamped
        : "Software development project built with modern technologies.";
    }),
  techStack: z
    .array(z.string())
    .nullish()
    .transform((val) => {
      const normalized = normalizeSkills(val ?? []);
      return normalized.length > 0 ? normalized.slice(0, 10) : ["TypeScript"];
    }),
  githubUrl: z
    .string()
    .nullish()
    .transform(sanitizeUrl),
  liveUrl: z
    .string()
    .nullish()
    .transform(sanitizeUrl),
  imageUrl: z
    .string()
    .nullish()
    .transform(() => ""),
  featured: z
    .boolean()
    .nullish()
    .transform((val) => Boolean(val))
});

/**
 * Master output schema parsed from Gemini.
 */
export const aiResumeOutputSchema = z.object({
  portfolio: aiPortfolioSchema,
  projects: z
    .array(aiProjectSchema)
    .nullish()
    .transform((val) => val ?? []),
  summary: z
    .object({
      yearsOfExperience: z.string().nullish().transform((v) => v ?? ""),
      primaryDomain: z.string().nullish().transform((v) => v ?? ""),
      topStrengths: z.array(z.string()).nullish().transform((v) => v ?? [])
    })
    .nullish()
    .transform((val) => val ?? { yearsOfExperience: "", primaryDomain: "", topStrengths: [] })
});

export type AiResumeOutput = {
  portfolio: PortfolioInput;
  projects: ProjectInput[];
  summary: {
    yearsOfExperience: string;
    primaryDomain: string;
    topStrengths: string[];
  };
};

/**
 * Strict Gemini Response Schema passed to Google Gen AI.
 * Guarantees zero markdown backticks and rigid JSON format.
 */
export const geminiResumeResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    portfolio: {
      type: Type.OBJECT,
      properties: {
        fullName: {
          type: Type.STRING,
          description: "Candidate's real full name as stated on the resume."
        },
        headline: {
          type: Type.STRING,
          description: "Concise developer headline (3-100 characters), e.g., 'Full-Stack Developer | React & Node.js'"
        },
        bio: {
          type: Type.STRING,
          description: "Professional, engaging summary tailored for a developer portfolio (max 500 characters). Highlight craft and core impact."
        },
        location: {
          type: Type.STRING,
          nullable: true,
          description: "City, Country or Remote, e.g., 'Bengaluru, India' or 'San Francisco, CA'"
        },
        email: {
          type: Type.STRING,
          nullable: true,
          description: "Candidate's email address if found."
        },
        githubUrl: {
          type: Type.STRING,
          nullable: true,
          description: "GitHub profile URL if found (e.g. https://github.com/username)."
        },
        linkedinUrl: {
          type: Type.STRING,
          nullable: true,
          description: "LinkedIn profile URL if found (e.g. https://linkedin.com/in/username)."
        },
        websiteUrl: {
          type: Type.STRING,
          nullable: true,
          description: "Personal website, blog, or portfolio URL if found."
        },
        skills: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          },
          description: "Top technical skills, frameworks, languages, and tools (up to 20 items, clean canonical names)."
        }
      },
      required: ["fullName", "headline", "bio", "skills"]
    },
    projects: {
      type: Type.ARRAY,
      description: "Notable personal, open-source, freelance, or featured engineering projects extracted from the resume.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: "Clear project name (e.g. 'DevLaunch Portfolio Builder')."
          },
          description: {
            type: Type.STRING,
            description: "Concise summary of what the project does, key features, and impact (20-300 characters)."
          },
          techStack: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING
            },
            description: "List of technologies, frameworks, and databases used in this project."
          },
          githubUrl: {
            type: Type.STRING,
            nullable: true,
            description: "GitHub repository URL if mentioned for this project."
          },
          liveUrl: {
            type: Type.STRING,
            nullable: true,
            description: "Live deployment or demo URL if mentioned."
          },
          featured: {
            type: Type.BOOLEAN,
            description: "True if this project is highlighted, award-winning, or one of the top 2 strongest works."
          }
        },
        required: ["title", "description", "techStack"]
      }
    },
    summary: {
      type: Type.OBJECT,
      properties: {
        yearsOfExperience: {
          type: Type.STRING,
          description: "Estimated years of experience or career level (e.g., '2+ years', 'New Graduate', '5 years')."
        },
        primaryDomain: {
          type: Type.STRING,
          description: "Primary engineering domain (e.g., 'Frontend Engineering', 'Backend / Cloud', 'Full-Stack Developer')."
        },
        topStrengths: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          },
          description: "3 key standout highlights of the candidate."
        }
      }
    }
  },
  required: ["portfolio", "projects"]
};
