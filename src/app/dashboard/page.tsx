"use client";

import {
  BarChart3,
  BriefcaseBusiness,
  CalendarCheck2,
  LogOut,
  PencilLine,
  Plus,
  Trophy
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/components/auth/AuthProvider";
import { StaggerContainer, StaggerItem } from "@/components/shared/AnimatedList";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { HoverRevealCard } from "@/components/shared/HoverRevealCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { WarmCard } from "@/components/shared/WarmCard";
import { Button, buttonVariants } from "@/components/ui/button";

const stats = [
  {
    title: "Portfolio Completion",
    value: "68%",
    detail: "Add projects and links to improve this score.",
    icon: BarChart3,
    accentClassName: "text-sahara-primary"
  },
  {
    title: "Applications",
    value: "12",
    detail: "Saved and applied internships will appear here.",
    icon: BriefcaseBusiness,
    accentClassName: "text-sahara-primary"
  },
  {
    title: "Interviews",
    value: "3",
    detail: "Track upcoming screens and technical rounds.",
    icon: CalendarCheck2,
    accentClassName: "text-amber-800"
  },
  {
    title: "Offers",
    value: "1",
    detail: "Celebrate wins while keeping the search organized.",
    icon: Trophy,
    accentClassName: "text-green-700"
  }
];

const recentActivity = [
  {
    title: "Interview Scheduled",
    description: "Stripe - Frontend Engineering Intern",
    time: "2h ago",
    reveal: "Prep notes and role context will live beside this activity."
  },
  {
    title: "Application Submitted",
    description: "Vercel - Design Engineer Summer 2025",
    time: "Yesterday",
    reveal: "A quick follow-up reminder can be attached after submission."
  },
  {
    title: "Portfolio Updated",
    description: "Added the campus marketplace project",
    time: "Oct 18",
    reveal: "Portfolio edits can become visible on your public page."
  }
];

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { appUser, logout, user } = useAuth();
  const router = useRouter();
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const displayName = appUser?.displayName || user?.displayName || "Developer";
  const email = appUser?.email || user?.email || "No email available";
  const username = appUser?.username || "username pending";

  async function handleLogout() {
    setLogoutError(null);
    setIsLoggingOut(true);

    try {
      await logout();
      router.replace("/login");
    } catch (error) {
      setLogoutError(
        error instanceof Error
          ? error.message
          : "Unable to log out right now. Please try again."
      );
      setIsLoggingOut(false);
    }
  }

  return (
    <DashboardShell>
      <AnimatedSection>
        <PageHeader
          action={
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button>
                <Plus aria-hidden="true" className="h-4 w-4" />
                New Application
              </Button>
              <Link
                className={buttonVariants()}
                href="/dashboard/projects/new"
              >
                <Plus aria-hidden="true" className="h-4 w-4" />
                Add Project
              </Link>
              <Button
                disabled={isLoggingOut}
                onClick={handleLogout}
                variant="secondary"
              >
                <LogOut aria-hidden="true" className="h-4 w-4" />
                {isLoggingOut ? "Logging out..." : "Log out"}
              </Button>
            </div>
          }
          description="Your portfolio, internship pipeline, and early-career progress will live here as the app grows."
          eyebrow={`Good morning, ${username}`}
          title="Welcome to DevLaunch"
        />
      </AnimatedSection>

      <AnimatedSection delay={0.08}>
        <WarmCard className="mt-8 flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {user?.photoURL ? (
              <div
                aria-label={`${displayName} avatar`}
                className="h-14 w-14 rounded-full border border-sahara-border/70 bg-cover bg-center"
                role="img"
                style={{ backgroundImage: `url(${user.photoURL})` }}
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-sahara-border/70 bg-sahara-surfaceLow font-serif text-2xl font-bold text-sahara-primary">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-sahara-muted">
                Signed in as
              </p>
              <p className="mt-1 font-serif text-2xl font-bold text-sahara-text">
                {displayName}
              </p>
              <p className="mt-1 text-sm text-sahara-muted">{email}</p>
              <p className="mt-1 text-sm font-semibold text-sahara-primary">
                /dev/{username}
              </p>
            </div>
          </div>
          {logoutError ? (
            <p className="rounded-lg border border-sahara-tertiary/25 bg-sahara-tertiary/10 px-4 py-3 text-sm leading-6 text-sahara-tertiary">
              {logoutError}
            </p>
          ) : null}
        </WarmCard>
      </AnimatedSection>

      <StaggerContainer
        className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
        staggerDelay={0.07}
      >
        {stats.map((stat) => (
          <StaggerItem key={stat.title} y={12}>
            <StatCard {...stat} />
          </StaggerItem>
        ))}
      </StaggerContainer>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1.45fr_0.85fr]">
        <AnimatedSection as="section" delay={0.16}>
          <div className="mb-5 flex items-center justify-between border-b border-sahara-border/60 pb-4">
            <h2 className="font-serif text-3xl font-bold tracking-tight text-sahara-text">
              Recent Activity
            </h2>
            <a
              className="text-sm font-semibold text-sahara-primary underline-offset-4 transition-colors hover:text-sahara-tertiary hover:underline"
              href="/dashboard"
            >
              View All
            </a>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <HoverRevealCard
                className="p-5"
                key={activity.title}
                reveal={activity.reveal}
              >
                <div className="flex gap-4">
                  <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fbe8d8] text-sahara-primary">
                    <BriefcaseBusiness aria-hidden="true" className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                      <h3 className="font-semibold text-sahara-text">
                        {activity.title}
                      </h3>
                      <span className="text-xs font-semibold text-sahara-muted">
                        {activity.time}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-sahara-muted">
                      {activity.description}
                    </p>
                  </div>
                </div>
              </HoverRevealCard>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection as="aside" className="space-y-6" delay={0.22}>
          <WarmCard tone="low">
            <h2 className="font-serif text-2xl font-bold text-sahara-text">
              Weekly Goal
            </h2>
            <p className="mt-3 text-sm leading-6 text-sahara-muted">
              Apply to 5 internships this week.
            </p>
            <div className="mt-5 h-2 rounded-full bg-sahara-border/60">
              <div className="h-2 w-3/5 rounded-full bg-sahara-primary" />
            </div>
            <div className="mt-3 flex justify-between text-xs font-semibold text-sahara-muted">
              <span>3 Applied</span>
              <span>2 Remaining</span>
            </div>
          </WarmCard>
          <WarmCard>
            <h2 className="font-serif text-2xl font-bold text-sahara-text">
              Polish Your Portfolio
            </h2>
            <p className="mt-3 text-sm leading-6 text-sahara-muted">
              Recruiters scan quickly. Keep your strongest projects and links
              easy to find.
            </p>
            <Link
              className={buttonVariants({
                className: "mt-6 w-full",
                variant: "secondary"
              })}
              href="/dashboard/profile"
            >
              <PencilLine aria-hidden="true" className="h-4 w-4" />
              Edit Portfolio
            </Link>
          </WarmCard>
          <WarmCard>
            <h2 className="font-serif text-2xl font-bold text-sahara-text">
              Shape Your Projects
            </h2>
            <p className="mt-3 text-sm leading-6 text-sahara-muted">
              Add the work you want recruiters to notice first.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link
                className={buttonVariants({
                  className: "w-full",
                  variant: "secondary"
                })}
                href="/dashboard/projects"
              >
                Manage Projects
              </Link>
              <Link
                className={buttonVariants({ className: "w-full" })}
                href="/dashboard/projects/new"
              >
                <Plus aria-hidden="true" className="h-4 w-4" />
                Add Project
              </Link>
            </div>
          </WarmCard>
        </AnimatedSection>
      </div>
    </DashboardShell>
  );
}
