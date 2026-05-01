"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { EditorialHeading } from "@/components/shared/EditorialHeading";
import { PageShell } from "@/components/shared/PageShell";
import { WarmCard } from "@/components/shared/WarmCard";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";

function logAuthDebug(message: string, details?: unknown) {
  console.info(`[AUTH DEBUG] ${message}`, details ?? "");
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const {
    appUser,
    firebaseUser,
    loading,
    logout,
    profileError,
    profileLoading,
    refreshUserProfile
  } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const appUsername = appUser?.username ?? null;
  const hasAppUser = Boolean(appUser);
  const isResolvingProfile = Boolean(firebaseUser && profileLoading);

  useEffect(() => {
    if (loading) {
      logAuthDebug("dashboard redirect decision", {
        action: "wait-loading",
        path: pathname,
        hasFirebaseUser: Boolean(firebaseUser),
        hasAppUser,
        hasProfileError: Boolean(profileError)
      });
      return;
    }

    if (!firebaseUser) {
      logAuthDebug("dashboard redirect decision", {
        action: "redirect-login",
        path: pathname,
        hasFirebaseUser: false,
        hasAppUser,
        hasProfileError: Boolean(profileError)
      });
      router.replace("/login");
      return;
    }

    if (profileError) {
      logAuthDebug("dashboard redirect decision", {
        action: "show-profile-error",
        path: pathname,
        hasFirebaseUser: true,
        hasAppUser,
        hasProfileError: true
      });
      return;
    }

    if (!hasAppUser) {
      logAuthDebug("dashboard redirect decision", {
        action: "redirect-login-missing-profile",
        path: pathname,
        hasFirebaseUser: true,
        hasAppUser: false,
        hasProfileError: false
      });
      router.replace("/login");
      return;
    }

    if (!appUsername) {
      logAuthDebug("dashboard redirect decision", {
        action: "redirect-onboarding",
        path: pathname,
        hasFirebaseUser: true,
        hasAppUser,
        username: appUsername
      });
      router.replace("/onboarding");
      return;
    }

    logAuthDebug("dashboard redirect decision", {
      action: "render",
      path: pathname,
      hasFirebaseUser: true,
      hasAppUser,
      username: appUsername
    });
  }, [
    appUsername,
    firebaseUser,
    hasAppUser,
    loading,
    pathname,
    profileError,
    router
  ]);

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

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

  if (profileError) {
    return (
      <PageShell className="flex items-center justify-center px-4 py-16">
        <AnimatedSection className="w-full max-w-md">
          <WarmCard className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-sahara-muted">
              Profile unavailable
            </p>
            <EditorialHeading className="mt-3 text-4xl">
              We could not load your DevLaunch profile
            </EditorialHeading>
            <p className="mt-4 text-sm leading-6 text-sahara-muted">
              {profileError}
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Button onClick={() => void refreshUserProfile()}>Try again</Button>
              <Button onClick={() => void handleLogout()} variant="secondary">
                Log out
              </Button>
            </div>
          </WarmCard>
        </AnimatedSection>
      </PageShell>
    );
  }

  if (!appUser?.username) {
    return null;
  }

  return children;
}
