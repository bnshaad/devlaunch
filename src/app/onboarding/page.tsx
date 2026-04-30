"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AtSign, ArrowRight, Rocket } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { EditorialHeading } from "@/components/shared/EditorialHeading";
import { PageShell } from "@/components/shared/PageShell";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { WarmCard } from "@/components/shared/WarmCard";
import { Button } from "@/components/ui/button";
import {
  checkUsernameAvailable,
  claimUsername,
  normalizeUsername,
  validateUsername
} from "@/services/userService";

function logAuthDebug(message: string, details?: unknown) {
  if (process.env.NODE_ENV !== "production") {
    console.info(`[AUTH DEBUG] ${message}`, details ?? "");
  }
}

export default function OnboardingPage() {
  const { appUser, firebaseUser, loading, refreshUserProfile } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const appUsername = appUser?.username ?? null;
  const hasAppUser = Boolean(appUser);
  const isResolvingProfile = Boolean(firebaseUser && !appUser);
  const normalizedUsername = useMemo(
    () => normalizeUsername(username),
    [username]
  );
  const validationMessage = username
    ? validateUsername(normalizedUsername)
    : null;

  useEffect(() => {
    if (loading) {
      logAuthDebug("onboarding redirect decision", {
        action: "wait-loading"
      });
      return;
    }

    if (!firebaseUser) {
      logAuthDebug("onboarding redirect decision", {
        action: "redirect-login"
      });
      router.replace("/login");
      return;
    }

    if (!hasAppUser) {
      logAuthDebug("onboarding redirect decision", {
        action: "wait-app-user"
      });
      return;
    }

    if (appUsername) {
      logAuthDebug("onboarding redirect decision", {
        action: "redirect-dashboard",
        username: appUsername
      });
      router.replace("/dashboard");
      return;
    }

    logAuthDebug("onboarding redirect decision", {
      action: "render-form",
      username: appUsername
    });
  }, [appUsername, firebaseUser, hasAppUser, loading, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!firebaseUser || isSaving) {
      return;
    }

    const nextUsername = normalizeUsername(username);
    const nextValidationMessage = validateUsername(nextUsername);

    if (nextValidationMessage) {
      setMessage(nextValidationMessage);
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const isAvailable = await checkUsernameAvailable(nextUsername);

      if (!isAvailable) {
        setMessage("That username is already taken.");
        return;
      }

      await claimUsername(firebaseUser.uid, nextUsername);
      await refreshUserProfile();
      router.replace("/dashboard");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to claim that username. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (loading || isResolvingProfile) {
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
            <WarmCard className="p-8 text-center sm:p-12">
              <p className="text-sm font-semibold uppercase tracking-wide text-sahara-muted">
                Checking access
              </p>
              <EditorialHeading className="mt-3 text-4xl leading-tight">
                Preparing profile setup
              </EditorialHeading>
              <p className="mt-4 text-sm leading-6 text-sahara-muted">
                We are confirming your Google session before opening username
                setup.
              </p>
            </WarmCard>
          </AnimatedSection>
        </div>
      </PageShell>
    );
  }

  if (!firebaseUser || appUsername) {
    return null;
  }

  return (
    <PageShell>
      <SiteHeader minimal />
      <div className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-14">
        <AnimatedSection
          amount={0.35}
          className="relative w-full max-w-lg"
          duration={0.6}
          y={20}
        >
          <WarmCard className="p-8 sm:p-12">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-[#fbe8d8] text-sahara-primary">
              <Rocket aria-hidden="true" className="h-7 w-7" />
            </div>
            <div className="text-center">
              <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-sahara-muted">
                Profile setup
              </p>
              <EditorialHeading className="text-4xl leading-tight sm:text-5xl">
                Choose your DevLaunch username
              </EditorialHeading>
              <p className="mt-4 text-sm leading-6 text-sahara-muted">
                Your username will become your public portfolio link. Pick
                something simple enough for recruiters to remember.
              </p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label
                  className="text-sm font-semibold text-sahara-text"
                  htmlFor="username"
                >
                  Username
                </label>
                <div className="mt-2 flex items-center gap-3 rounded-lg border border-sahara-border bg-white px-3 py-2 transition focus-within:border-sahara-primary focus-within:ring-2 focus-within:ring-sahara-primary/15">
                  <AtSign
                    aria-hidden="true"
                    className="h-5 w-5 shrink-0 text-sahara-primary"
                  />
                  <input
                    autoComplete="username"
                    className="min-w-0 flex-1 bg-transparent text-sm text-sahara-text outline-none placeholder:text-sahara-muted"
                    disabled={loading || isResolvingProfile || isSaving}
                    id="username"
                    onChange={(event) => {
                      setUsername(normalizeUsername(event.target.value));
                      setMessage(null);
                    }}
                    placeholder="binshad_01"
                    value={username}
                  />
                </div>
                <p className="mt-2 text-xs leading-5 text-sahara-muted">
                  Use 3-20 lowercase letters, numbers, hyphens, or underscores.
                </p>
              </div>

              <div className="rounded-xl border border-sahara-border/60 bg-sahara-surfaceLow/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-sahara-muted">
                  Portfolio preview
                </p>
                <p className="mt-2 break-all font-serif text-2xl font-bold text-sahara-text">
                  /dev/{normalizedUsername || "username"}
                </p>
              </div>

              {message || validationMessage ? (
                <div
                  className="rounded-lg border border-sahara-tertiary/25 bg-sahara-tertiary/10 px-4 py-3 text-sm leading-6 text-sahara-tertiary"
                  role="alert"
                >
                  {message || validationMessage}
                </div>
              ) : null}

              <Button
                className="w-full"
                disabled={
                  loading ||
                  isResolvingProfile ||
                  isSaving ||
                  Boolean(validationMessage)
                }
                size="lg"
                type="submit"
              >
                {isSaving ? "Claiming username..." : "Continue to dashboard"}
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Button>
            </form>

            <p className="mt-6 text-center text-sm leading-6 text-sahara-muted">
              Signed in with the wrong account?{" "}
              <Link
                className="font-semibold text-sahara-primary underline-offset-4 hover:underline"
                href="/login"
              >
                Return to login
              </Link>
            </p>
          </WarmCard>
        </AnimatedSection>
      </div>
    </PageShell>
  );
}
