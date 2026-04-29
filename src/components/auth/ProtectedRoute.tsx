"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { EditorialHeading } from "@/components/shared/EditorialHeading";
import { PageShell } from "@/components/shared/PageShell";
import { WarmCard } from "@/components/shared/WarmCard";
import { useAuth } from "@/components/auth/AuthProvider";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, router, user]);

  if (loading) {
    return (
      <PageShell className="flex items-center justify-center px-4 py-16">
        <AnimatedSection className="w-full max-w-md">
          <WarmCard className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-sahara-muted">
              Checking access
            </p>
            <EditorialHeading className="mt-3 text-4xl">
              Preparing your dashboard
            </EditorialHeading>
            <p className="mt-4 text-sm leading-6 text-sahara-muted">
              We are confirming your session before opening your workspace.
            </p>
          </WarmCard>
        </AnimatedSection>
      </PageShell>
    );
  }

  if (!user) {
    return null;
  }

  return children;
}
