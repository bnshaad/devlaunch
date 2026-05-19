"use client";

import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/components/auth/AuthProvider";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { PortfolioForm } from "@/components/portfolio/PortfolioForm";
import { PortfolioPreview } from "@/components/portfolio/PortfolioPreview";
import { ProfilePhotoUploader } from "@/components/portfolio/ProfilePhotoUploader";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { PageHeader } from "@/components/shared/PageHeader";
import { WarmCard } from "@/components/shared/WarmCard";
import { buttonVariants } from "@/components/ui/button";
import { normalizeSkills } from "@/lib/skills";
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

function portfolioToFormValues(portfolio: Portfolio | null): PortfolioInput {
  if (!portfolio) {
    return { ...emptyPortfolio };
  }

  return {
    fullName: portfolio.fullName,
    headline: portfolio.headline,
    bio: portfolio.bio,
    location: portfolio.location,
    email: portfolio.email ?? "",
    githubUrl: portfolio.githubUrl ?? "",
    linkedinUrl: portfolio.linkedinUrl ?? "",
    websiteUrl: portfolio.websiteUrl ?? "",
    skills: normalizeSkills(portfolio.skills),
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
  const { appUser, refreshUserProfile, user } = useAuth();
  const publicUrl = appUser?.username ? `/dev/${appUser.username}` : null;
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [previewPortfolio, setPreviewPortfolio] =
    useState<PortfolioInput>(emptyPortfolio);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const profilePhotoDisplayName =
    previewPortfolio.fullName.trim() ||
    appUser?.username ||
    appUser?.displayName ||
    "Developer";

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
        setPreviewPortfolio(portfolioToFormValues(existingPortfolio));
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
  }, [user?.uid]);

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
      if (process.env.NODE_ENV !== "production") {
        console.info("[PORTFOLIO DEBUG] Saving portfolio", {
          ...values,
          skills: normalizeSkills(values.skills)
        });
      }

      const savedPortfolio = await createOrUpdatePortfolio(userId, values);

      if (!savedPortfolio) {
        throw new Error("Portfolio saved, but the updated profile could not be loaded.");
      }

      setPortfolio(savedPortfolio);
      setPreviewPortfolio(portfolioToFormValues(savedPortfolio));
      setSaveMessage("Portfolio saved. Your profile draft is up to date.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to save your portfolio right now.";
      console.error("[PORTFOLIO DEBUG] Unable to save portfolio:", {
        message
      });
      setSaveError(message);
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
        <div className="mt-8 grid gap-10 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)] xl:gap-12">
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
            <WarmCard className="mb-6 p-5">
              <p className="text-sm font-semibold text-sahara-text">
                Public URL
              </p>
              {publicUrl ? (
                <p className="mt-2 break-all font-serif text-2xl font-bold text-sahara-primary">
                  {publicUrl}
                </p>
              ) : (
                <p className="mt-2 text-sm font-semibold text-sahara-text">
                  Complete onboarding to claim your public URL.
                </p>
              )}
            </WarmCard>
            {appUser ? (
              <ProfilePhotoUploader
                displayName={profilePhotoDisplayName}
                onPhotoChanged={async () => {
                  await refreshUserProfile();
                }}
                user={appUser}
              />
            ) : null}
            <PortfolioForm
              defaultValues={portfolioToFormValues(portfolio)}
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
