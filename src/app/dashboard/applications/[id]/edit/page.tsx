"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/components/auth/AuthProvider";
import { ApplicationForm } from "@/components/applications/ApplicationForm";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { PageHeader } from "@/components/shared/PageHeader";
import { WarmCard } from "@/components/shared/WarmCard";
import { buttonVariants } from "@/components/ui/button";
import {
  getApplicationById,
  updateApplication
} from "@/services/applicationService";
import {
  type InternshipApplication,
  type InternshipApplicationInput
} from "@/types/application";

function applicationToFormValues(
  application: InternshipApplication
): InternshipApplicationInput {
  return {
    company: application.company,
    role: application.role,
    location: application.location,
    jobUrl: application.jobUrl,
    source: application.source,
    status: application.status,
    appliedDate: application.appliedDate,
    deadline: application.deadline,
    notes: application.notes
  };
}

export default function EditApplicationPage() {
  return (
    <ProtectedRoute>
      <EditApplicationContent />
    </ProtectedRoute>
  );
}

function EditApplicationContent() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [application, setApplication] =
    useState<InternshipApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const applicationId = params.id;

  useEffect(() => {
    if (!applicationId || !user?.uid) {
      return;
    }

    const userId = user.uid;
    let isActive = true;

    async function loadApplication() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const existingApplication = await getApplicationById(applicationId);

        if (!isActive) {
          return;
        }

        if (!existingApplication) {
          setLoadError("Application was not found.");
          return;
        }

        if (existingApplication.userId !== userId) {
          setLoadError("You do not have permission to edit this application.");
          return;
        }

        setApplication(existingApplication);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setLoadError(
          error instanceof Error
            ? error.message
            : "Unable to load this application right now."
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadApplication();

    return () => {
      isActive = false;
    };
  }, [applicationId, user?.uid]);

  async function handleSubmit(values: InternshipApplicationInput) {
    if (!user?.uid || !application) {
      throw new Error("You must be signed in to update an application.");
    }

    setSaveError(null);

    try {
      await updateApplication(application.id, user.uid, values);
      router.replace("/dashboard/applications");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to update this application right now.";
      setSaveError(message);
      throw error;
    }
  }

  return (
    <DashboardShell>
      <AnimatedSection>
        <PageHeader
          action={
            <Link
              className={buttonVariants({ variant: "secondary" })}
              href="/dashboard/applications"
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              Applications
            </Link>
          }
          description="Update the details and status for this internship opportunity."
          eyebrow="Edit application"
          title={application?.company || "Application"}
        />
      </AnimatedSection>

      {isLoading ? (
        <AnimatedSection className="mt-8" delay={0.08}>
          <WarmCard className="flex items-center gap-4">
            <Loader2
              aria-hidden="true"
              className="h-5 w-5 animate-spin text-sahara-primary"
            />
            <p className="font-semibold text-sahara-text">
              Loading application
            </p>
          </WarmCard>
        </AnimatedSection>
      ) : loadError ? (
        <AnimatedSection className="mt-8" delay={0.08}>
          <WarmCard className="border-sahara-tertiary/30 bg-sahara-tertiary/10">
            <p className="font-semibold text-sahara-tertiary">{loadError}</p>
          </WarmCard>
        </AnimatedSection>
      ) : application ? (
        <>
          {saveError ? (
            <AnimatedSection className="mt-8" delay={0.08}>
              <WarmCard className="border-sahara-tertiary/30 bg-sahara-tertiary/10">
                <p className="font-semibold text-sahara-tertiary">
                  {saveError}
                </p>
              </WarmCard>
            </AnimatedSection>
          ) : null}
          <AnimatedSection className="mt-8" delay={0.08}>
            <ApplicationForm
              defaultValues={applicationToFormValues(application)}
              onSubmit={handleSubmit}
              submitLabel="Update Application"
            />
          </AnimatedSection>
        </>
      ) : null}
    </DashboardShell>
  );
}
