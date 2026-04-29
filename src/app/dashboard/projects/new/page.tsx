"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/components/auth/AuthProvider";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { PageHeader } from "@/components/shared/PageHeader";
import { WarmCard } from "@/components/shared/WarmCard";
import { buttonVariants } from "@/components/ui/button";
import { createProject } from "@/services/projectService";
import { type ProjectInput } from "@/types/project";

const emptyProject: ProjectInput = {
  title: "",
  description: "",
  techStack: [],
  githubUrl: "",
  liveUrl: "",
  imageUrl: "",
  featured: false
};

export default function NewProjectPage() {
  return (
    <ProtectedRoute>
      <NewProjectContent />
    </ProtectedRoute>
  );
}

function NewProjectContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [saveError, setSaveError] = useState<string | null>(null);

  async function handleSubmit(values: ProjectInput) {
    if (!user?.uid) {
      throw new Error("You must be signed in to create a project.");
    }

    setSaveError(null);

    try {
      await createProject(user.uid, values);
      router.push("/dashboard/projects");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to create this project right now.";
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
          description="Add a project that can appear on your public DevLaunch portfolio."
          eyebrow="New project"
          title="Add Project"
        />
      </AnimatedSection>

      {saveError ? (
        <AnimatedSection className="mt-8" delay={0.08}>
          <WarmCard className="border-sahara-tertiary/30 bg-sahara-tertiary/10">
            <p className="font-semibold text-sahara-tertiary">{saveError}</p>
          </WarmCard>
        </AnimatedSection>
      ) : null}

      <AnimatedSection className="mt-8" delay={0.08}>
        <ProjectForm
          defaultValues={emptyProject}
          onSubmit={handleSubmit}
          submitLabel="Create Project"
        />
      </AnimatedSection>
    </DashboardShell>
  );
}
