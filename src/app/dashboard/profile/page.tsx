"use client";

import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/components/auth/AuthProvider";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { PortfolioForm } from "@/components/portfolio/PortfolioForm";
import { PortfolioPreview } from "@/components/portfolio/PortfolioPreview";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { PageHeader } from "@/components/shared/PageHeader";
import { WarmCard } from "@/components/shared/WarmCard";
import { buttonVariants } from "@/components/ui/button";
import {
  createOrUpdatePortfolio,
  getPortfolio
} from "@/services/portfolioService";
import { type Portfolio, type PortfolioInput } from "@/types/portfolio";

const emptyPortfolio: PortfolioInput = {
  fullName: "",
  headline: "",
  bio: "",
  location: "",
  email: "",
  githubUrl: "",
  linkedinUrl: "",
  websiteUrl: "",
  skills: [],
  isPublic: false
};

function portfolioToFormValues(
  portfolio: Portfolio | null,
  fallbackFullName = ""
): PortfolioInput {
  if (!portfolio) {
    return {
      ...emptyPortfolio,
      fullName: fallbackFullName
    };
  }

  return {
    fullName: portfolio.fullName || fallbackFullName,
    headline: portfolio.headline,
    bio: portfolio.bio,
    location: portfolio.location,
    email: portfolio.email ?? "",
    githubUrl: portfolio.githubUrl ?? "",
    linkedinUrl: portfolio.linkedinUrl ?? "",
    websiteUrl: portfolio.websiteUrl ?? "",
    skills: portfolio.skills,
    isPublic: portfolio.isPublic
  };
}

export default function DashboardProfilePage() {
  return (
    <ProtectedRoute>
      <DashboardProfileContent />
    </ProtectedRoute>
  );
}

function DashboardProfileContent() {
  const { appUser, user } = useAuth();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [previewPortfolio, setPreviewPortfolio] =
    useState<PortfolioInput>(emptyPortfolio);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) {
      return;
    }

    const userId = user.uid;
    let isActive = true;

    async function loadPortfolio() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const existingPortfolio = await getPortfolio(userId);

        if (!isActive) {
          return;
        }

        setPortfolio(existingPortfolio);
        setPreviewPortfolio(
          portfolioToFormValues(
            existingPortfolio,
            appUser?.displayName || user?.displayName || ""
          )
        );
      } catch (error) {
        if (!isActive) {
          return;
        }

        setLoadError(
          error instanceof Error
            ? error.message
            : "Unable to load your portfolio. Please try again."
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadPortfolio();

    return () => {
      isActive = false;
    };
  }, [appUser?.displayName, user?.displayName, user?.uid]);

  const handleValuesChange = useCallback((values: PortfolioInput) => {
    setPreviewPortfolio(values);
  }, []);

  async function handleSubmit(values: PortfolioInput) {
    const userId = user?.uid;

    if (!userId) {
      throw new Error("You must be signed in to save a portfolio.");
    }

    setSaveMessage(null);
    setSaveError(null);

    try {
      const savedPortfolio = await createOrUpdatePortfolio(userId, values);
      setPortfolio(savedPortfolio);
      setPreviewPortfolio(values);
      setSaveMessage("Portfolio saved. Your profile draft is up to date.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to save your portfolio right now.";
      setSaveError(message);
      throw error;
    }
  }

  return (
    <DashboardShell>
      <AnimatedSection>
        <PageHeader
          action={
            <div className="flex flex-col gap-3 sm:flex-row">
              {appUser?.username ? (
                <Link
                  className={buttonVariants({ variant: "primary" })}
                  href={`/dev/${appUser.username}`}
                >
                  <ExternalLink aria-hidden="true" className="h-4 w-4" />
                  View Public Portfolio
                </Link>
              ) : null}
              <Link
                className={buttonVariants({ variant: "secondary" })}
                href="/dashboard"
              >
                <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                Dashboard
              </Link>
            </div>
          }
          description="Craft the profile details that will power your public portfolio page in the next DevLaunch step."
          eyebrow={`Portfolio builder${appUser?.username ? ` - /dev/${appUser.username}` : ""}`}
          title="Edit Portfolio"
        />
      </AnimatedSection>

      {isLoading ? (
        <AnimatedSection className="mt-8" delay={0.08}>
          <WarmCard className="flex items-center gap-4">
            <Loader2
              aria-hidden="true"
              className="h-5 w-5 animate-spin text-sahara-primary"
            />
            <div>
              <p className="font-semibold text-sahara-text">
                Loading your portfolio
              </p>
              <p className="mt-1 text-sm text-sahara-muted">
                We are checking Firestore for any saved profile details.
              </p>
            </div>
          </WarmCard>
        </AnimatedSection>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
          <AnimatedSection delay={0.08}>
            {loadError ? (
              <WarmCard className="mb-6 border-sahara-tertiary/30 bg-sahara-tertiary/10">
                <p className="font-semibold text-sahara-tertiary">
                  {loadError}
                </p>
              </WarmCard>
            ) : null}
            {saveMessage ? (
              <WarmCard className="mb-6 border-green-700/20 bg-green-50">
                <p className="font-semibold text-green-800">{saveMessage}</p>
              </WarmCard>
            ) : null}
            {saveError ? (
              <WarmCard className="mb-6 border-sahara-tertiary/30 bg-sahara-tertiary/10">
                <p className="font-semibold text-sahara-tertiary">
                  {saveError}
                </p>
              </WarmCard>
            ) : null}
            <PortfolioForm
              defaultValues={portfolioToFormValues(
                portfolio,
                appUser?.displayName || user?.displayName || ""
              )}
              key={portfolio?.updatedAt?.toMillis?.() ?? portfolio?.headline ?? "new"}
              onSubmit={handleSubmit}
              onValuesChange={handleValuesChange}
            />
          </AnimatedSection>

          <AnimatedSection as="aside" delay={0.14}>
            <PortfolioPreview
              portfolio={previewPortfolio}
              username={appUser?.username}
            />
          </AnimatedSection>
        </div>
      )}
    </DashboardShell>
  );
}
