"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Rocket } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { EditorialHeading } from "@/components/shared/EditorialHeading";
import { PageShell } from "@/components/shared/PageShell";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { WarmCard } from "@/components/shared/WarmCard";
import { Button } from "@/components/ui/button";

function logAuthDebug(message: string, details?: unknown) {
  if (process.env.NODE_ENV !== "production") {
    console.info(`[AUTH DEBUG] ${message}`, details ?? "");
  }
}

export default function LoginPage() {
  const {
    appUser,
    authError,
    clearAuthError,
    firebaseUser,
    loading,
    signInWithGoogle,
  } = useAuth();
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const displayedError = error || authError;
  const appUsername = appUser?.username ?? null;
  const hasAppUser = Boolean(appUser);
  const isResolvingProfile = Boolean(firebaseUser && !appUser);
  const isCheckingSession = loading || isResolvingProfile;

  useEffect(() => {
    if (loading || !firebaseUser || !hasAppUser) {
      logAuthDebug("login page redirect decision", {
        action: "wait",
        hasFirebaseUser: Boolean(firebaseUser),
        hasAppUser,
        loading
      });
      return;
    }

    if (appUsername) {
      logAuthDebug("login page redirect decision", {
        action: "redirect-dashboard",
        username: appUsername
      });
      router.replace("/dashboard");
      return;
    }

    logAuthDebug("login page redirect decision", {
      action: "redirect-onboarding",
      username: appUsername
    });
    router.replace("/onboarding");
  }, [appUsername, firebaseUser, hasAppUser, loading, router]);

  async function handleGoogleSignIn() {
    setError(null);
    clearAuthError();
    setIsSigningIn(true);

    try {
      await signInWithGoogle();
      setIsSigningIn(false);
    } catch (signInError) {
      setError(
        signInError instanceof Error
          ? signInError.message
          : "Unable to sign in with Google. Please try again."
      );
      setIsSigningIn(false);
    }
  }

  return (
    <PageShell>
      <SiteHeader minimal />
      <div className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-14">
        <AnimatedSection
          amount={0.35}
          className="relative w-full max-w-md"
          duration={0.6}
          y={20}
        >
          <WarmCard className="p-8 sm:p-12">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-[#fbe8d8] text-sahara-primary">
              <Rocket aria-hidden="true" className="h-7 w-7" />
            </div>
            <div className="text-center">
              <p className="mb-4 font-serif text-2xl font-bold text-sahara-primary">
                DevLaunch
              </p>
              <EditorialHeading className="text-4xl leading-tight">
                Welcome back
              </EditorialHeading>
              <p className="mt-3 text-sm leading-6 text-sahara-muted">
                Continue with Google to build your portfolio and track internship
                progress.
              </p>
            </div>
            <Button
              className="mt-8 w-full"
              disabled={isCheckingSession || isSigningIn}
              onClick={handleGoogleSignIn}
              size="lg"
            >
              <span
                aria-hidden="true"
                className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-sahara-primary"
              >
                G
              </span>
              {isCheckingSession
                ? "Checking session..."
                : isSigningIn
                  ? "Opening Google..."
                  : "Continue with Google"}
            </Button>
            {displayedError ? (
              <div
                className="mt-4 rounded-lg border border-sahara-tertiary/25 bg-sahara-tertiary/10 px-4 py-3 text-sm leading-6 text-sahara-tertiary"
                role="alert"
              >
                {displayedError}
              </div>
            ) : null}
            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-sahara-border/70" />
              <span className="text-xs font-semibold uppercase tracking-wide text-sahara-muted">
                Google authentication
              </span>
              <div className="h-px flex-1 bg-sahara-border/70" />
            </div>
            <p className="text-center text-sm leading-6 text-sahara-muted">
              New here? Your account setup starts after Google sign-in.
            </p>
            <Link
              href="/"
              className="mt-6 block text-center text-sm font-semibold text-sahara-primary underline-offset-4 transition-colors hover:text-sahara-tertiary hover:underline"
            >
              Back to landing page
            </Link>
          </WarmCard>
        </AnimatedSection>
      </div>
    </PageShell>
  );
}
