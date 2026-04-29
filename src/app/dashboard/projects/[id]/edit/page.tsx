"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/components/auth/AuthProvider";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { PageHeader } from "@/components/shared/PageHeader";
import { WarmCard } from "@/components/shared/WarmCard";
import { buttonVariants } from "@/components/ui/button";
import {
  getProjectById,
  updateProject
} from "@/services/projectService";
import { type Project, type ProjectInput } from "@/types/project";

function projectToFormValues(project: Project): ProjectInput {
  return {
    title: project.title,
    description: project.description,
    techStack: project.techStack,
    githubUrl: project.githubUrl,
    liveUrl: project.liveUrl,
    imageUrl: project.imageUrl,
    featured: project.featured
  };
}

export default function EditProjectPage() {
  return (
    <ProtectedRoute>
      <EditProjectContent />
    </ProtectedRoute>
  );
}

function EditProjectContent() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const projectId = params.id;

  useEffect(() => {
    if (!projectId || !user?.uid) {
      return;
    }

    const userId = user.uid;
    let isActive = true;

    async function loadProject() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const existingProject = await getProjectById(projectId);

        if (!isActive) {
          return;
        }

        if (!existingProject) {
          setLoadError("Project was not found.");
          return;
        }

        if (existingProject.userId !== userId) {
          setLoadError("You do not have permission to edit this project.");
          return;
        }

        setProject(existingProject);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setLoadError(
          error instanceof Error
            ? error.message
            : "Unable to load this project right now."
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadProject();

    return () => {
      isActive = false;
    };
  }, [projectId, user?.uid]);

  async function handleSubmit(values: ProjectInput) {
    if (!user?.uid || !project) {
      throw new Error("You must be signed in to update a project.");
    }

    setSaveError(null);

    try {
      await updateProject(project.id, user.uid, values);
      router.push("/dashboard/projects");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to update this project right now.";
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
              href="/dashboard/projects"
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              Projects
            </Link>
          }
          description="Update the project details shown on your public portfolio."
          eyebrow="Edit project"
          title={project?.title || "Project"}
        />
      </AnimatedSection>

      {isLoading ? (
        <AnimatedSection className="mt-8" delay={0.08}>
          <WarmCard className="flex items-center gap-4">
            <Loader2
              aria-hidden="true"
              className="h-5 w-5 animate-spin text-sahara-primary"
            />
            <p className="font-semibold text-sahara-text">Loading project</p>
          </WarmCard>
        </AnimatedSection>
      ) : loadError ? (
        <AnimatedSection className="mt-8" delay={0.08}>
          <WarmCard className="border-sahara-tertiary/30 bg-sahara-tertiary/10">
            <p className="font-semibold text-sahara-tertiary">{loadError}</p>
          </WarmCard>
        </AnimatedSection>
      ) : project ? (
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
            <ProjectForm
              defaultValues={projectToFormValues(project)}
              onSubmit={handleSubmit}
              submitLabel="Update Project"
            />
          </AnimatedSection>
        </>
      ) : null}
    </DashboardShell>
  );
}
