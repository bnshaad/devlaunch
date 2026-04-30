"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/components/auth/AuthProvider";
import { ApplicationForm } from "@/components/applications/ApplicationForm";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { PageHeader } from "@/components/shared/PageHeader";
import { WarmCard } from "@/components/shared/WarmCard";
import { buttonVariants } from "@/components/ui/button";
import { createApplication } from "@/services/applicationService";
import { type InternshipApplicationInput } from "@/types/application";

const emptyApplication: InternshipApplicationInput = {
  company: "",
  role: "",
  location: "",
  jobUrl: "",
  source: "",
  status: "saved",
  appliedDate: "",
  deadline: "",
  notes: ""
};

export default function NewApplicationPage() {
  return (
    <ProtectedRoute>
      <NewApplicationContent />
    </ProtectedRoute>
  );
}

function NewApplicationContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [saveError, setSaveError] = useState<string | null>(null);

  async function handleSubmit(values: InternshipApplicationInput) {
    if (!user?.uid) {
      throw new Error("You must be signed in to create an application.");
    }

    setSaveError(null);

    try {
      await createApplication(user.uid, values);
      router.replace("/dashboard/applications");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to create this application right now.";
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
          description="Add an internship opportunity and keep the next step visible."
          eyebrow="New application"
          title="Add Application"
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
        <ApplicationForm
          defaultValues={emptyApplication}
          onSubmit={handleSubmit}
          submitLabel="Create Application"
        />
      </AnimatedSection>
    </DashboardShell>
  );
}
