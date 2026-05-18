"use client";

/* eslint-disable @next/next/no-img-element */

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
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { getPortfolio } from "@/services/portfolioService";
import { getApplicationsByUser } from "@/services/applicationService";
import { getProjectsByUser } from "@/services/projectService";
import {
  APPLICATION_STATUSES,
  type ApplicationStatus,
  type InternshipApplication
} from "@/types/application";
import { type Portfolio } from "@/types/portfolio";
import { type Project } from "@/types/project";

const statusLabels: Record<ApplicationStatus, string> = {
  saved: "Saved",
  applied: "Applied",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected"
};

type ActivityItem = {
  title: string;
  description: string;
  time: string;
  reveal: string;
  sortTime: number;
};

function getEmailPrefix(email?: string | null) {
  const trimmedEmail = email?.trim();

  if (!trimmedEmail) {
    return null;
  }

  return trimmedEmail.split("@")[0] || trimmedEmail;
}

function formatCount(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function getTimestampMillis(
  timestamp?: { toMillis?: () => number } | null
) {
  return timestamp?.toMillis?.() ?? 0;
}

function formatActivityTime(sortTime: number) {
  if (!sortTime) {
    return "Recently";
  }

  const elapsedMs = Date.now() - sortTime;
  const elapsedHours = Math.floor(elapsedMs / (1000 * 60 * 60));

  if (elapsedHours < 1) {
    return "Just now";
  }

  if (elapsedHours < 24) {
    return `${elapsedHours}h ago`;
  }

  const elapsedDays = Math.floor(elapsedHours / 24);

  if (elapsedDays === 1) {
    return "Yesterday";
  }

  if (elapsedDays < 7) {
    return `${elapsedDays}d ago`;
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric"
  }).format(new Date(sortTime));
}

function createStatusCounts(applications: InternshipApplication[]) {
  return APPLICATION_STATUSES.reduce<Record<ApplicationStatus, number>>(
    (counts, status) => {
      counts[status] = applications.filter(
        (application) => application.status === status
      ).length;

      return counts;
    },
    {
      saved: 0,
      applied: 0,
      interview: 0,
      offer: 0,
      rejected: 0
    }
  );
}

function buildRecentActivity(
  portfolio: Portfolio | null,
  projects: Project[],
  applications: InternshipApplication[]
) {
  const projectActivity = projects.map<ActivityItem>((project) => {
    const sortTime =
      getTimestampMillis(project.updatedAt) ||
      getTimestampMillis(project.createdAt);

    return {
      title: "Project updated",
      description: project.title,
      time: formatActivityTime(sortTime),
      reveal: project.featured
        ? "Featured projects appear first on your public portfolio."
        : "This project appears after featured projects on your public portfolio.",
      sortTime
    };
  });

  const applicationActivity = applications.map<ActivityItem>((application) => {
    const sortTime =
      getTimestampMillis(application.updatedAt) ||
      getTimestampMillis(application.createdAt);

    return {
      title: `${statusLabels[application.status]} application`,
      description: `${application.role} at ${application.company}`,
      time: formatActivityTime(sortTime),
      reveal: application.deadline
        ? `Deadline: ${application.deadline}`
        : `Status: ${statusLabels[application.status]}`,
      sortTime
    };
  });

  const portfolioUpdatedAt =
    getTimestampMillis(portfolio?.updatedAt) ||
    getTimestampMillis(portfolio?.createdAt);
  const portfolioActivity =
    portfolio && portfolioUpdatedAt
      ? [
          {
            title: "Portfolio updated",
            description: portfolio.isPublic
              ? "Your public portfolio is live."
              : "Your portfolio is saved as a private draft.",
            time: formatActivityTime(portfolioUpdatedAt),
            reveal: portfolio.isPublic
              ? "Public visitors can read your portfolio profile."
              : "Turn on public visibility when you are ready to share.",
            sortTime: portfolioUpdatedAt
          }
        ]
      : [];

  return [...applicationActivity, ...projectActivity, ...portfolioActivity]
    .sort((firstActivity, secondActivity) => {
      return secondActivity.sortTime - firstActivity.sortTime;
    })
    .slice(0, 4);
}

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
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [applications, setApplications] = useState<InternshipApplication[]>(
    []
  );
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);
  const displayName = useMemo(
    () =>
      portfolio?.fullName?.trim() ||
      appUser?.username?.trim() ||
      getEmailPrefix(appUser?.email || user?.email) ||
      "Developer",
    [appUser?.email, appUser?.username, portfolio?.fullName, user?.email]
  );
  const email = appUser?.email || user?.email || "No email available";
  const username = appUser?.username || "username pending";
  const statusCounts = useMemo(
    () => createStatusCounts(applications),
    [applications]
  );
  const featuredProjectCount = useMemo(
    () => projects.filter((project) => project.featured).length,
    [projects]
  );
  const recentActivity = useMemo(
    () => buildRecentActivity(portfolio, projects, applications),
    [applications, portfolio, projects]
  );
  const stats = useMemo(
    () => [
      {
        title: "Portfolio",
        value: isDashboardLoading
          ? "..."
          : portfolio
            ? portfolio.isPublic
              ? "Public"
              : "Draft"
            : "New",
        detail: portfolio
          ? portfolio.isPublic
            ? `Public profile is live at /dev/${username}.`
            : "Portfolio exists, but public visibility is off."
          : "Create your portfolio details when you are ready.",
        icon: BarChart3,
        accentClassName: "text-sahara-primary"
      },
      {
        title: "Projects",
        value: isDashboardLoading ? "..." : String(projects.length),
        detail: `${formatCount(featuredProjectCount, "featured project")} pinned first on the public portfolio.`,
        icon: BriefcaseBusiness,
        accentClassName: "text-sahara-primary"
      },
      {
        title: "Applications",
        value: isDashboardLoading ? "..." : String(applications.length),
        detail: `${statusCounts.applied} applied, ${statusCounts.rejected} rejected.`,
        icon: CalendarCheck2,
        accentClassName: "text-amber-800"
      },
      {
        title: "Interviews / Offers",
        value: isDashboardLoading
          ? "..."
          : `${statusCounts.interview}/${statusCounts.offer}`,
        detail: "Interview stages and offers from your tracker.",
        icon: Trophy,
        accentClassName: "text-green-700"
      }
    ],
    [
      applications.length,
      featuredProjectCount,
      isDashboardLoading,
      portfolio,
      projects.length,
      statusCounts.applied,
      statusCounts.interview,
      statusCounts.offer,
      statusCounts.rejected,
      username
    ]
  );

  const loadDashboardData = useCallback(async (showLoading = true) => {
    const userId = user?.uid;

    if (!userId) {
      setPortfolio(null);
      setProjects([]);
      setApplications([]);
      setIsDashboardLoading(false);
      return;
    }

    if (showLoading) {
      setIsDashboardLoading(true);
    }

    try {
      setDashboardError(null);

      const [nextPortfolio, nextProjects, nextApplications] =
        await Promise.all([
          getPortfolio(userId),
          getProjectsByUser(userId),
          getApplicationsByUser(userId)
        ]);

      setPortfolio(nextPortfolio);
      setProjects(nextProjects);
      setApplications(nextApplications);
    } catch (error) {
      console.error("Unable to load dashboard data:", error);
      setDashboardError(
        error instanceof Error
          ? error.message
          : "Unable to load dashboard data right now."
      );
    } finally {
      setIsDashboardLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    let isActive = true;

    async function refreshDashboardData() {
      if (isActive) {
        await loadDashboardData(false);
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        void refreshDashboardData();
      }
    }

    const initialLoadId = window.setTimeout(() => {
      void loadDashboardData(false);
    }, 0);
    window.addEventListener("focus", refreshDashboardData);
    window.addEventListener("pageshow", refreshDashboardData);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isActive = false;
      window.clearTimeout(initialLoadId);
      window.removeEventListener("focus", refreshDashboardData);
      window.removeEventListener("pageshow", refreshDashboardData);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadDashboardData]);

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
              <Link
                className={buttonVariants()}
                href="/dashboard/applications/new"
              >
                <Plus aria-hidden="true" className="h-4 w-4" />
                New Application
              </Link>
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
          eyebrow={`Good morning, ${displayName}`}
          title="Welcome to DevLaunch"
        />
      </AnimatedSection>

      <AnimatedSection delay={0.08}>
        <WarmCard className="mt-8 flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {appUser?.photoURL ? (
              <img
                alt={`${displayName} avatar`}
                className="h-14 w-14 rounded-full border border-sahara-border/70 object-cover"
                referrerPolicy="no-referrer"
                src={appUser.photoURL}
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

      {dashboardError ? (
        <AnimatedSection delay={0.12}>
          <WarmCard
            className="mt-8 border-sahara-tertiary/25 bg-sahara-tertiary/10"
            tone="low"
          >
            <h2 className="font-serif text-2xl font-bold text-sahara-text">
              Dashboard data needs a refresh
            </h2>
            <p className="mt-3 text-sm leading-6 text-sahara-muted">
              {dashboardError}
            </p>
            <Button
              className="mt-5"
              onClick={() => void loadDashboardData()}
              variant="secondary"
            >
              Refresh dashboard
            </Button>
          </WarmCard>
        </AnimatedSection>
      ) : null}

      <div className="mt-12 grid gap-8 lg:grid-cols-[1.45fr_0.85fr]">
        <AnimatedSection as="section" delay={0.16}>
          <div className="mb-5 flex items-center justify-between border-b border-sahara-border/60 pb-4">
            <h2 className="font-serif text-3xl font-bold tracking-tight text-sahara-text">
              Recent Activity
            </h2>
            <Link
              className="text-sm font-semibold text-sahara-primary underline-offset-4 transition-colors hover:text-sahara-tertiary hover:underline"
              href="/dashboard/applications"
            >
              Open Tracker
            </Link>
          </div>
          <div className="space-y-4">
            {isDashboardLoading ? (
              <WarmCard tone="low">
                <p className="text-sm leading-6 text-sahara-muted">
                  Loading your latest projects, applications, and portfolio
                  updates.
                </p>
              </WarmCard>
            ) : recentActivity.length ? (
              recentActivity.map((activity) => (
                <HoverRevealCard
                  className="p-5"
                  key={`${activity.title}-${activity.description}`}
                  reveal={activity.reveal}
                >
                  <div className="flex gap-4">
                    <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fbe8d8] text-sahara-primary">
                      <BriefcaseBusiness
                        aria-hidden="true"
                        className="h-5 w-5"
                      />
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
              ))
            ) : (
              <WarmCard tone="low">
                <h3 className="font-serif text-2xl font-bold text-sahara-text">
                  No activity yet
                </h3>
                <p className="mt-3 text-sm leading-6 text-sahara-muted">
                  Add a project, save an application, or update your portfolio
                  to start building your dashboard timeline.
                </p>
              </WarmCard>
            )}
          </div>
        </AnimatedSection>

        <AnimatedSection as="aside" className="space-y-6" delay={0.22}>
          <WarmCard tone="low">
            <h2 className="font-serif text-2xl font-bold text-sahara-text">
              Application Pipeline
            </h2>
            <p className="mt-3 text-sm leading-6 text-sahara-muted">
              Status counts are pulled from your saved internship tracker.
            </p>
            <div className="mt-5 space-y-3">
              {APPLICATION_STATUSES.map((status) => (
                <div
                  className="flex items-center justify-between rounded-lg border border-sahara-border/60 bg-sahara-surfaceLow px-4 py-3 text-sm"
                  key={status}
                >
                  <span className="font-semibold text-sahara-text">
                    {statusLabels[status]}
                  </span>
                  <span className="font-serif text-xl font-bold text-sahara-primary">
                    {isDashboardLoading ? "..." : statusCounts[status]}
                  </span>
                </div>
              ))}
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
