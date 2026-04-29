"use client";

import { AlertCircle, EyeOff, Loader2, SearchX } from "lucide-react";
import Link from "next/link";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { EditorialHeading } from "@/components/shared/EditorialHeading";
import { PageShell } from "@/components/shared/PageShell";
import { WarmCard } from "@/components/shared/WarmCard";
import { buttonVariants } from "@/components/ui/button";

type PublicPortfolioStateVariant =
  | "error"
  | "loading"
  | "not-found"
  | "private";

type PublicPortfolioStateProps = {
  variant: PublicPortfolioStateVariant;
  username?: string;
  message?: string;
};

const stateContent: Record<
  PublicPortfolioStateVariant,
  {
    eyebrow: string;
    title: string;
    description: string;
    icon: typeof AlertCircle;
  }
> = {
  error: {
    eyebrow: "Something went quiet",
    title: "We could not load this portfolio",
    description:
      "The portfolio may be temporarily unavailable. Please try again in a moment.",
    icon: AlertCircle
  },
  loading: {
    eyebrow: "Loading portfolio",
    title: "Preparing this public profile",
    description: "We are finding the saved DevLaunch portfolio details.",
    icon: Loader2
  },
  "not-found": {
    eyebrow: "Portfolio not found",
    title: "This portfolio does not exist yet",
    description:
      "The username may be unavailable, or this developer has not created a public portfolio.",
    icon: SearchX
  },
  private: {
    eyebrow: "Private portfolio",
    title: "This portfolio is private",
    description:
      "The owner has not made this DevLaunch portfolio public yet.",
    icon: EyeOff
  }
};

export function PublicPortfolioState({
  variant,
  username,
  message
}: PublicPortfolioStateProps) {
  const content = stateContent[variant];
  const Icon = content.icon;
  const isLoading = variant === "loading";

  return (
    <PageShell className="flex items-center justify-center px-4 py-16">
      <AnimatedSection className="w-full max-w-xl">
        <WarmCard className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sahara-surfaceLow text-sahara-primary">
            <Icon
              aria-hidden="true"
              className={`h-7 w-7 ${isLoading ? "animate-spin" : ""}`}
            />
          </div>
          <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-sahara-muted">
            {content.eyebrow}
            {username ? ` - /dev/${username}` : ""}
          </p>
          <EditorialHeading className="mt-3 text-4xl leading-none md:text-5xl">
            {content.title}
          </EditorialHeading>
          <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-sahara-muted">
            {message || content.description}
          </p>
          {!isLoading ? (
            <Link
              className={buttonVariants({ className: "mt-7" })}
              href="/"
            >
              Back to Home
            </Link>
          ) : null}
        </WarmCard>
      </AnimatedSection>
    </PageShell>
  );
}
