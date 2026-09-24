"use client";

import { ArrowLeft, ExternalLink, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import {
  createProject,
  getProjectsByUser
} from "@/services/projectService";
import { type Portfolio, type PortfolioInput } from "@/types/portfolio";
import { type Project, type ProjectInput } from "@/types/project";
import dynamic from "next/dynamic";
import { AiResumeButton } from "@/components/portfolio/AiResumeButton";

const ResumeImportModal = dynamic(
  () =>
    import("@/components/portfolio/ResumeImportModal").then(
      (mod) => mod.ResumeImportModal
    ),
  { ssr: false }
);

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
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [existingProjects, setExistingProjects] = useState<Project[]>([]);
  const [formRevision, setFormRevision] = useState(0);

  const formDefaultValues = useMemo(
    () => portfolioToFormValues(portfolio),
    [portfolio]
  );
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
        const [existingPortfolio, userProjects] = await Promise.all([
          getPortfolio(userId),
          getProjectsByUser(userId).catch(() => [])
        ]);

        if (!isActive) {
          return;
        }

        setPortfolio(existingPortfolio);
        setPreviewPortfolio(portfolioToFormValues(existingPortfolio));
        setExistingProjects(userProjects);
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

  const handleApplyAiData = useCallback(
    async ({
      portfolio: importedPortfolio,
      selectedProjects
    }: {
      portfolio: PortfolioInput;
      selectedProjects: ProjectInput[];
    }) => {
      const userId = user?.uid;
      if (!userId) return;

      setPreviewPortfolio(importedPortfolio);
      setPortfolio((prev) => ({
        userId,
        fullName: importedPortfolio.fullName,
        headline: importedPortfolio.headline,
        bio: importedPortfolio.bio,
        location: importedPortfolio.location,
        email: importedPortfolio.email ?? "",
        githubUrl: importedPortfolio.githubUrl ?? "",
        linkedinUrl: importedPortfolio.linkedinUrl ?? "",
        websiteUrl: importedPortfolio.websiteUrl ?? "",
        skills: importedPortfolio.skills,
        isPublic: importedPortfolio.isPublic,
        createdAt: prev?.createdAt,
        updatedAt: prev?.updatedAt
      }));
      setFormRevision((r) => r + 1);

      let createdProjectsCount = 0;
      if (selectedProjects.length > 0) {
        const results = await Promise.allSettled(
          selectedProjects.map((project) => createProject(userId, project))
        );
        createdProjectsCount = results.filter(
          (result) => result.status === "fulfilled"
        ).length;
        const updatedProjects = await getProjectsByUser(userId);
        setExistingProjects(updatedProjects);
      }

      setSaveMessage(
        `Resume imported! Applied profile details${
          createdProjectsCount > 0
            ? ` and created ${createdProjectsCount} project(s)`
            : ""
        }. Review your draft below and click 'Save Portfolio' to publish.`
      );
    },
    [user?.uid]
  );

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
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <AiResumeButton onClick={() => setIsAiModalOpen(true)}>
                Import Resume
              </AiResumeButton>
              {appUser?.username ? (
                <Link
                  className={buttonVariants({ variant: "primary" })}
                  href={`/dev/${appUser.username}`}
                >
                  <ExternalLink aria-hidden="true" className="h-4 w-4" />
                  View Public Portfolio
                </Link>
              ) : (
                <span
                  aria-disabled="true"
                  className={buttonVariants({
                    className: "cursor-not-allowed opacity-60",
                    variant: "primary"
                  })}
                  title="Complete onboarding to claim your public profile URL."
                >
                  <ExternalLink aria-hidden="true" className="h-4 w-4" />
                  View Public Portfolio
                </span>
              )}
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
            <WarmCard className="mb-6 border-sahara-primary/30 bg-gradient-to-r from-sahara-primary/10 via-amber-500/5 to-transparent p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sahara-primary/15 text-sahara-primary flex-shrink-0 mt-0.5">
                    <Sparkles className="h-5 w-5 text-sahara-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-sahara-text">
                      Autofill Portfolio with AI
                    </p>
                    <p className="mt-0.5 text-xs text-sahara-muted leading-relaxed">
                      Upload your resume or CV (PDF/Text) to instantly draft your headline, bio, skills, and projects.
                    </p>
                  </div>
                </div>
                <AiResumeButton
                  onClick={() => setIsAiModalOpen(true)}
                  variant="secondary"
                  className="sm:self-center flex-shrink-0"
                >
                  Import Resume
                </AiResumeButton>
              </div>
            </WarmCard>
            <PortfolioForm
              defaultValues={formDefaultValues}
              key={`${portfolio?.updatedAt?.toMillis?.() ?? portfolio?.headline ?? "new"}-rev-${formRevision}`}
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

      <ResumeImportModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        currentPortfolio={previewPortfolio}
        existingProjects={existingProjects}
        onApply={handleApplyAiData}
      />
    </DashboardShell>
  );
}
