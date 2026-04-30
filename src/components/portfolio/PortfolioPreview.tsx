"use client";

import { Eye, EyeOff, MapPin } from "lucide-react";
import { WarmCard } from "@/components/shared/WarmCard";
import { type PortfolioInput } from "@/types/portfolio";

type PortfolioPreviewProps = {
  portfolio: PortfolioInput;
  username?: string | null;
};

export function PortfolioPreview({ portfolio, username }: PortfolioPreviewProps) {
  const VisibilityIcon = portfolio.isPublic ? Eye : EyeOff;

  return (
    <WarmCard className="lg:sticky lg:top-8">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-sahara-muted">
          Preview
        </p>
        <span className="inline-flex items-center gap-2 rounded-full border border-sahara-border/70 bg-sahara-background px-3 py-1 text-xs font-semibold text-sahara-muted">
          <VisibilityIcon aria-hidden="true" className="h-3.5 w-3.5" />
          {portfolio.isPublic ? "Public" : "Private"}
        </span>
      </div>

      <div className="mt-7">
        <p className="text-sm font-semibold text-sahara-primary">
          /dev/{username || "username"}
        </p>
        <h2 className="mt-3 font-serif text-4xl font-bold leading-tight text-sahara-text">
          {portfolio.fullName || "Your public name"}
        </h2>
        <p className="mt-3 font-serif text-2xl font-bold leading-tight text-sahara-primary">
          {portfolio.headline || "Your portfolio headline"}
        </p>
        {portfolio.location ? (
          <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-sahara-muted">
            <MapPin aria-hidden="true" className="h-4 w-4 text-sahara-primary" />
            {portfolio.location}
          </p>
        ) : null}
        <p className="mt-5 text-sm leading-7 text-sahara-muted">
          {portfolio.bio ||
            "Add a concise bio that helps recruiters understand what you build and where you are growing."}
        </p>
      </div>

      <div className="mt-7 border-t border-sahara-border/60 pt-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-sahara-muted">
          Skills
        </p>
        {portfolio.skills.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {portfolio.skills.map((skill) => (
              <span
                className="rounded-full border border-sahara-border/70 bg-sahara-background px-3 py-1 text-xs font-semibold text-sahara-muted"
                key={skill}
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-sahara-muted">
            Your selected skills will appear here.
          </p>
        )}
      </div>
    </WarmCard>
  );
}
