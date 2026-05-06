"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, Rocket } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
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
    logout,
    profileError,
    profileLoading,
    refreshUserProfile,
    signInWithEmailPassword,
    signInWithGoogle
  } = useAuth();
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isTesterSigningIn, setIsTesterSigningIn] = useState(false);
  const [testerEmail, setTesterEmail] = useState("");
  const [testerPassword, setTesterPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const displayedError = error || authError || profileError;
  const appUsername = appUser?.username ?? null;
  const hasAppUser = Boolean(appUser);
  const isResolvingProfile = Boolean(firebaseUser && profileLoading);
  const isCheckingSession = loading || isResolvingProfile;

  useEffect(() => {
    if (loading || !firebaseUser) {
      logAuthDebug("login page redirect decision", {
        action: "wait",
        hasFirebaseUser: Boolean(firebaseUser),
        hasAppUser,
        loading
      });
      return;
    }

    if (profileError) {
      logAuthDebug("login page redirect decision", {
        action: "show-profile-error",
        hasFirebaseUser: Boolean(firebaseUser),
        hasAppUser,
        loading,
        hasProfileError: true
      });
      return;
    }

    if (!hasAppUser) {
      logAuthDebug("login page redirect decision", {
        action: "profile-missing-show-login",
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
  }, [appUsername, firebaseUser, hasAppUser, loading, profileError, router]);

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

  async function handleTesterSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    clearAuthError();
    setIsTesterSigningIn(true);

    try {
      await signInWithEmailPassword(testerEmail, testerPassword);
      setIsTesterSigningIn(false);
    } catch (signInError) {
      setError(
        signInError instanceof Error
          ? signInError.message
          : "Unable to sign in with the tester account. Please try again."
      );
      setIsTesterSigningIn(false);
    }
  }

  async function handleRetryProfile() {
    setError(null);
    clearAuthError();
    await refreshUserProfile();
  }

  async function handleLogout() {
    setError(null);
    clearAuthError();
    await logout();
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
              disabled={isCheckingSession || isSigningIn || isTesterSigningIn}
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
                {firebaseUser && profileError ? (
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <Button onClick={() => void handleRetryProfile()} size="sm">
                      Try again
                    </Button>
                    <Button
                      onClick={() => void handleLogout()}
                      size="sm"
                      variant="secondary"
                    >
                      Log out
                    </Button>
                  </div>
                ) : null}
              </div>
            ) : null}
            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-sahara-border/70" />
              <span className="text-xs font-semibold uppercase tracking-wide text-sahara-muted">
                QA access
              </span>
              <div className="h-px flex-1 bg-sahara-border/70" />
            </div>
            <form
              className="space-y-4 rounded-xl border border-sahara-border/70 bg-sahara-surfaceLow/60 p-4"
              onSubmit={handleTesterSignIn}
            >
              <div>
                <p className="text-sm font-semibold text-sahara-text">
                  Tester login
                </p>
                <p className="mt-1 text-xs leading-5 text-sahara-muted">
                  For QA only. Use test account instructions from README or
                  deployment notes.
                </p>
              </div>
              <div>
                <label
                  className="text-sm font-semibold text-sahara-text"
                  htmlFor="tester-email"
                >
                  Email
                </label>
                <div className="mt-2 flex items-center gap-3 rounded-lg border border-sahara-border bg-white px-3 py-2 transition focus-within:border-sahara-primary focus-within:ring-2 focus-within:ring-sahara-primary/15">
                  <Mail
                    aria-hidden="true"
                    className="h-5 w-5 shrink-0 text-sahara-primary"
                  />
                  <input
                    autoComplete="email"
                    className="min-w-0 flex-1 bg-transparent text-sm text-sahara-text outline-none placeholder:text-sahara-muted"
                    disabled={
                      isCheckingSession || isSigningIn || isTesterSigningIn
                    }
                    id="tester-email"
                    inputMode="email"
                    onChange={(event) => {
                      setTesterEmail(event.target.value);
                      setError(null);
                    }}
                    placeholder="tester@example.com"
                    required
                    type="email"
                    value={testerEmail}
                  />
                </div>
              </div>
              <div>
                <label
                  className="text-sm font-semibold text-sahara-text"
                  htmlFor="tester-password"
                >
                  Password
                </label>
                <div className="mt-2 flex items-center gap-3 rounded-lg border border-sahara-border bg-white px-3 py-2 transition focus-within:border-sahara-primary focus-within:ring-2 focus-within:ring-sahara-primary/15">
                  <Lock
                    aria-hidden="true"
                    className="h-5 w-5 shrink-0 text-sahara-primary"
                  />
                  <input
                    autoComplete="current-password"
                    className="min-w-0 flex-1 bg-transparent text-sm text-sahara-text outline-none placeholder:text-sahara-muted"
                    disabled={
                      isCheckingSession || isSigningIn || isTesterSigningIn
                    }
                    id="tester-password"
                    onChange={(event) => {
                      setTesterPassword(event.target.value);
                      setError(null);
                    }}
                    placeholder="Password"
                    required
                    type="password"
                    value={testerPassword}
                  />
                </div>
              </div>
              <Button
                className="w-full"
                disabled={
                  isCheckingSession ||
                  isSigningIn ||
                  isTesterSigningIn ||
                  !testerEmail ||
                  !testerPassword
                }
                size="sm"
                type="submit"
                variant="secondary"
              >
                {isTesterSigningIn ? "Signing in..." : "Sign in as tester"}
              </Button>
            </form>
            <p className="mt-6 text-center text-sm leading-6 text-sahara-muted">
              New here? Account setup starts after sign-in.
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
