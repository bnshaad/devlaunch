"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { EditorialHeading } from "@/components/shared/EditorialHeading";
import { PageShell } from "@/components/shared/PageShell";
import { WarmCard } from "@/components/shared/WarmCard";
import { useAuth } from "@/components/auth/AuthProvider";

function logAuthDebug(message: string, details?: unknown) {
  if (process.env.NODE_ENV !== "production") {
    console.info(`[AUTH DEBUG] ${message}`, details ?? "");
  }
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { appUser, firebaseUser, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const appUsername = appUser?.username ?? null;
  const hasAppUser = Boolean(appUser);
  const isResolvingProfile = Boolean(firebaseUser && !appUser);

  useEffect(() => {
    if (loading) {
      logAuthDebug("dashboard redirect decision", {
        action: "wait-loading",
        path: pathname
      });
      return;
    }

    if (!firebaseUser) {
      logAuthDebug("dashboard redirect decision", {
        action: "redirect-login",
        path: pathname
      });
      router.replace("/login");
      return;
    }

    if (!hasAppUser) {
      logAuthDebug("dashboard redirect decision", {
        action: "wait-app-user",
        path: pathname
      });
      return;
    }

    if (!appUsername) {
      logAuthDebug("dashboard redirect decision", {
        action: "redirect-onboarding",
        path: pathname,
        username: appUsername
      });
      router.replace("/onboarding");
      return;
    }

    logAuthDebug("dashboard redirect decision", {
      action: "render",
      path: pathname,
      username: appUsername
    });
  }, [appUsername, firebaseUser, hasAppUser, loading, pathname, router]);

  if (loading || isResolvingProfile) {
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

  if (!firebaseUser) {
    return null;
  }

  if (!appUser?.username) {
    return null;
  }

  return children;
}
