"use client";

import { BriefcaseBusiness, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/components/auth/AuthProvider";
import { ApplicationCard } from "@/components/applications/ApplicationCard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { StaggerContainer, StaggerItem } from "@/components/shared/AnimatedList";
import { PageHeader } from "@/components/shared/PageHeader";
import { WarmCard } from "@/components/shared/WarmCard";
import { buttonVariants } from "@/components/ui/button";
import {
  deleteApplication,
  getApplicationsByUser
} from "@/services/applicationService";
import { type InternshipApplication } from "@/types/application";

export default function DashboardApplicationsPage() {
  return (
    <ProtectedRoute>
      <DashboardApplicationsContent />
    </ProtectedRoute>
  );
}

function DashboardApplicationsContent() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<InternshipApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingApplicationId, setDeletingApplicationId] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (!user?.uid) {
      return;
    }

    const userId = user.uid;
    let isActive = true;

    async function loadApplications() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const userApplications = await getApplicationsByUser(userId);

        if (!isActive) {
          return;
        }

        setApplications(userApplications);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setLoadError(
          error instanceof Error
            ? error.message
            : "Unable to load applications right now."
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadApplications();

    return () => {
      isActive = false;
    };
  }, [user?.uid]);

  async function handleDelete(application: InternshipApplication) {
    if (!user?.uid) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${application.role}" at ${application.company}? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setDeleteMessage(null);
    setDeleteError(null);
    setDeletingApplicationId(application.id);

    try {
      await deleteApplication(application.id, user.uid);
      setApplications((currentApplications) =>
        currentApplications.filter(
          (currentApplication) => currentApplication.id !== application.id
        )
      );
      setDeleteMessage("Application deleted.");
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : "Unable to delete this application right now."
      );
    } finally {
      setDeletingApplicationId(null);
    }
  }

  return (
    <DashboardShell>
      <AnimatedSection>
        <PageHeader
          action={
            <Link
              className={buttonVariants()}
              href="/dashboard/applications/new"
            >
              <Plus aria-hidden="true" className="h-4 w-4" />
              Add Application
            </Link>
          }
          description="Track internship opportunities, deadlines, notes, and next steps."
          eyebrow="Internship tracker"
          title="Applications"
        />
      </AnimatedSection>

      {loadError ? (
        <AnimatedSection className="mt-8" delay={0.08}>
          <WarmCard className="border-sahara-tertiary/30 bg-sahara-tertiary/10">
            <p className="font-semibold text-sahara-tertiary">{loadError}</p>
          </WarmCard>
        </AnimatedSection>
      ) : null}

      {deleteMessage ? (
        <AnimatedSection className="mt-8" delay={0.08}>
          <WarmCard className="border-green-700/20 bg-green-50">
            <p className="font-semibold text-green-800">{deleteMessage}</p>
          </WarmCard>
        </AnimatedSection>
      ) : null}

      {deleteError ? (
        <AnimatedSection className="mt-8" delay={0.08}>
          <WarmCard className="border-sahara-tertiary/30 bg-sahara-tertiary/10">
            <p className="font-semibold text-sahara-tertiary">{deleteError}</p>
          </WarmCard>
        </AnimatedSection>
      ) : null}

      {loadError ? null : isLoading ? (
        <AnimatedSection className="mt-8" delay={0.08}>
          <WarmCard>
            <p className="text-sm font-semibold uppercase tracking-wide text-sahara-muted">
              Loading applications
            </p>
            <p className="mt-3 text-sm leading-7 text-sahara-muted">
              We are finding your saved internship opportunities.
            </p>
          </WarmCard>
        </AnimatedSection>
      ) : applications.length ? (
        <StaggerContainer
          className="mt-8 grid gap-6 xl:grid-cols-2"
          staggerDelay={0.06}
        >
          {applications.map((application) => (
            <StaggerItem key={application.id} y={10}>
              <ApplicationCard
                application={application}
                isDeleting={deletingApplicationId === application.id}
                onDelete={handleDelete}
              />
            </StaggerItem>
          ))}
        </StaggerContainer>
      ) : (
        <AnimatedSection className="mt-8" delay={0.08}>
          <WarmCard className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sahara-surfaceLow text-sahara-primary">
              <BriefcaseBusiness aria-hidden="true" className="h-7 w-7" />
            </div>
            <h2 className="mt-6 font-serif text-4xl font-bold text-sahara-text">
              No applications yet
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-sahara-muted">
              Save your first internship lead so follow-ups, deadlines, and
              decisions stay in one calm workspace.
            </p>
            <Link
              className={buttonVariants({ className: "mt-7" })}
              href="/dashboard/applications/new"
            >
              <Plus aria-hidden="true" className="h-4 w-4" />
              Add Application
            </Link>
          </WarmCard>
        </AnimatedSection>
      )}
    </DashboardShell>
  );
}
