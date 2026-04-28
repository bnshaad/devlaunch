import {
  BarChart3,
  BriefcaseBusiness,
  CalendarCheck2,
  Plus,
  Trophy
} from "lucide-react";
import { StaggerContainer, StaggerItem } from "@/components/shared/AnimatedList";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { StatCard } from "@/components/dashboard/StatCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { WarmCard } from "@/components/shared/WarmCard";
import { Button } from "@/components/ui/button";

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

export default function DashboardPage() {
  return (
    <DashboardShell>
      <AnimatedSection>
        <PageHeader
          action={
            <Button>
              <Plus aria-hidden="true" className="h-4 w-4" />
              New Application
            </Button>
          }
          description="Your portfolio, internship pipeline, and early-career progress will live here as the app grows."
          eyebrow="Good morning, Alex"
          title="Welcome to DevLaunch"
        />
      </AnimatedSection>

      <StaggerContainer className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StaggerItem key={stat.title}>
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
            {[
              [
                "Interview Scheduled",
                "Stripe - Frontend Engineering Intern",
                "2h ago"
              ],
              [
                "Application Submitted",
                "Vercel - Design Engineer Summer 2025",
                "Yesterday"
              ],
              [
                "Portfolio Updated",
                "Added the campus marketplace project",
                "Oct 18"
              ]
            ].map(([title, description, time]) => (
              <WarmCard
                className="flex gap-4 p-5 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-sahara-surfaceLow"
                key={title}
              >
                <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fbe8d8] text-sahara-primary">
                  <BriefcaseBusiness aria-hidden="true" className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <h3 className="font-semibold text-sahara-text">{title}</h3>
                    <span className="text-xs font-semibold text-sahara-muted">
                      {time}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-sahara-muted">
                    {description}
                  </p>
                </div>
              </WarmCard>
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
            <Button className="mt-6 w-full" variant="secondary">
              Edit Portfolio
            </Button>
          </WarmCard>
        </AnimatedSection>
      </div>
    </DashboardShell>
  );
}
