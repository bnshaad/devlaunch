"use client";

import { ExternalLink, Github, PencilLine, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { WarmCard } from "@/components/shared/WarmCard";
import { buttonVariants } from "@/components/ui/button";
import { type Project } from "@/types/project";

type ProjectCardProps = {
  project: Project;
  mode?: "dashboard" | "public";
  onDelete?: (project: Project) => void;
  isDeleting?: boolean;
};

function safeExternalUrl(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  try {
    const url = new URL(trimmedValue);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return url.href;
  } catch {
    return null;
  }
}

export function TechBadge({ tech }: { tech: string }) {
  return (
    <span className="rounded-full border border-sahara-border/70 bg-sahara-background px-3 py-1 text-xs font-semibold text-sahara-muted">
      {tech}
    </span>
  );
}

export function ProjectCard({
  isDeleting = false,
  mode = "dashboard",
  onDelete,
  project
}: ProjectCardProps) {
  const githubUrl = safeExternalUrl(project.githubUrl);
  const liveUrl = safeExternalUrl(project.liveUrl);
  const imageUrl = safeExternalUrl(project.imageUrl);

  return (
    <WarmCard className="flex h-full flex-col overflow-hidden p-0">
      {imageUrl ? (
        <div
          aria-label={`${project.title} project image`}
          className="aspect-[16/9] border-b border-sahara-border/60 bg-sahara-surfaceLow bg-cover bg-center"
          role="img"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      ) : null}
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-serif text-2xl font-bold leading-tight text-sahara-text">
              {project.title}
            </h3>
            {project.featured ? (
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-sahara-primary/20 bg-[#fbe8d8] px-3 py-1 text-xs font-semibold text-sahara-primary">
                <Star aria-hidden="true" className="h-3.5 w-3.5" />
                Featured
              </span>
            ) : null}
          </div>
        </div>
        <p className="mt-4 line-clamp-4 text-sm leading-7 text-sahara-muted">
          {project.description}
        </p>
        {project.techStack.length ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <TechBadge key={tech} tech={tech} />
            ))}
          </div>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-3">
          {githubUrl ? (
            <a
              className={buttonVariants({ size: "sm", variant: "secondary" })}
              href={githubUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              <Github aria-hidden="true" className="h-4 w-4" />
              GitHub
            </a>
          ) : null}
          {liveUrl ? (
            <a
              className={buttonVariants({ size: "sm", variant: "secondary" })}
              href={liveUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              <ExternalLink aria-hidden="true" className="h-4 w-4" />
              Live
            </a>
          ) : null}
        </div>
        {mode === "dashboard" ? (
          <div className="mt-auto flex flex-wrap gap-3 pt-7">
            <Link
              className={buttonVariants({ size: "sm", variant: "primary" })}
              href={`/dashboard/projects/${project.id}/edit`}
            >
              <PencilLine aria-hidden="true" className="h-4 w-4" />
              Edit
            </Link>
            <button
              className={buttonVariants({ size: "sm", variant: "secondary" })}
              disabled={isDeleting}
              onClick={() => onDelete?.(project)}
              type="button"
            >
              <Trash2 aria-hidden="true" className="h-4 w-4" />
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        ) : null}
      </div>
    </WarmCard>
  );
}
