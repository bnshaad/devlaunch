"use client";

import { FolderOpen, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/components/auth/AuthProvider";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { StaggerContainer, StaggerItem } from "@/components/shared/AnimatedList";
import { PageHeader } from "@/components/shared/PageHeader";
import { WarmCard } from "@/components/shared/WarmCard";
import { buttonVariants } from "@/components/ui/button";
import {
  deleteProject,
  getProjectsByUser
} from "@/services/projectService";
import { type Project } from "@/types/project";

export default function DashboardProjectsPage() {
  return (
    <ProtectedRoute>
      <DashboardProjectsContent />
    </ProtectedRoute>
  );
}

function DashboardProjectsContent() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) {
      return;
    }

    const userId = user.uid;
    let isActive = true;

    async function loadProjects() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const userProjects = await getProjectsByUser(userId);

        if (!isActive) {
          return;
        }

        setProjects(userProjects);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setLoadError(
          error instanceof Error
            ? error.message
            : "Unable to load projects right now."
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadProjects();

    return () => {
      isActive = false;
    };
  }, [user?.uid]);

  async function handleDelete(project: Project) {
    if (!user?.uid) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${project.title}"? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setDeleteMessage(null);
    setDeleteError(null);
    setDeletingProjectId(project.id);

    try {
      await deleteProject(project.id, user.uid);
      const updatedProjects = await getProjectsByUser(user.uid);
      setProjects(updatedProjects);
      setDeleteMessage("Project deleted.");
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : "Unable to delete this project right now."
      );
    } finally {
      setDeletingProjectId(null);
    }
  }

  return (
    <DashboardShell>
      <AnimatedSection>
        <PageHeader
          action={
            <Link
              className={buttonVariants()}
              href="/dashboard/projects/new"
            >
              <Plus aria-hidden="true" className="h-4 w-4" />
              Add Project
            </Link>
          }
          description="Manage the projects that appear on your public portfolio."
          eyebrow="Portfolio projects"
          title="Projects"
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
              Loading projects
            </p>
            <p className="mt-3 text-sm leading-7 text-sahara-muted">
              We are finding your saved project cards.
            </p>
          </WarmCard>
        </AnimatedSection>
      ) : projects.length ? (
        <StaggerContainer
          className="mt-8 grid gap-6 md:grid-cols-2"
          staggerDelay={0.06}
        >
          {projects.map((project) => (
            <StaggerItem key={project.id} y={10}>
              <ProjectCard
                isDeleting={deletingProjectId === project.id}
                onDelete={handleDelete}
                project={project}
              />
            </StaggerItem>
          ))}
        </StaggerContainer>
      ) : (
        <AnimatedSection className="mt-8" delay={0.08}>
          <WarmCard className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sahara-surfaceLow text-sahara-primary">
              <FolderOpen aria-hidden="true" className="h-7 w-7" />
            </div>
            <h2 className="mt-6 font-serif text-4xl font-bold text-sahara-text">
              No projects yet
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-sahara-muted">
              Add your strongest work so recruiters can understand how you build.
            </p>
            <Link
              className={buttonVariants({ className: "mt-7" })}
              href="/dashboard/projects/new"
            >
              <Plus aria-hidden="true" className="h-4 w-4" />
              Add Project
            </Link>
          </WarmCard>
        </AnimatedSection>
      )}
    </DashboardShell>
  );
}
