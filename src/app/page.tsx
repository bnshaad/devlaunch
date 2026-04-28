import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  PlayCircle,
  Rocket,
  UserRound
} from "lucide-react";
import { StaggerContainer, StaggerItem } from "@/components/shared/AnimatedList";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { EditorialHeading } from "@/components/shared/EditorialHeading";
import { PageShell } from "@/components/shared/PageShell";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { WarmCard } from "@/components/shared/WarmCard";
import { buttonVariants } from "@/components/ui/button";

const features = [
  {
    title: "Public developer portfolio",
    description:
      "Show your projects, skills, links, and career story in a recruiter-friendly profile.",
    icon: UserRound
  },
  {
    title: "Internship application tracker",
    description:
      "Organize companies, roles, statuses, deadlines, and notes from one focused dashboard.",
    icon: BriefcaseBusiness
  },
  {
    title: "Progress analytics",
    description:
      "See portfolio completion, interview momentum, offer progress, and next actions clearly.",
    icon: BarChart3
  }
];

export default function Home() {
  return (
    <PageShell>
      <SiteHeader />
      <SectionContainer className="grid min-h-[calc(100vh-5rem)] items-center gap-16 overflow-hidden lg:grid-cols-[1.02fr_0.98fr]">
        <AnimatedSection amount={0.35} className="relative z-10 max-w-3xl">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-sahara-border/70 bg-sahara-surfaceLow px-3 py-1.5 text-sm font-semibold text-sahara-muted">
            <Rocket aria-hidden="true" className="h-4 w-4 text-sahara-primary" />
            Student career dashboard
          </div>
          <EditorialHeading className="text-5xl leading-[1.05] md:text-7xl">
            Build your portfolio.{" "}
            <span className="font-normal italic text-sahara-primary">
              Track your internships.
            </span>{" "}
            Launch your developer career.
          </EditorialHeading>
          <p className="mt-7 max-w-xl text-lg leading-8 text-sahara-muted md:text-xl">
            DevLaunch is a warm, focused workspace for students to showcase
            projects, organize internship applications, and move with clarity.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/login"
              className={buttonVariants({ variant: "primary", size: "lg" })}
            >
              Get Started
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
            <Link
              href="/demo"
              className={buttonVariants({ variant: "secondary", size: "lg" })}
            >
              View Demo
              <PlayCircle aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </AnimatedSection>

        <AnimatedSection amount={0.35} className="relative" delay={0.12}>
          <WarmCard className="relative overflow-hidden p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-sahara-muted">This week</p>
                <p className="mt-1 font-serif text-3xl font-bold text-sahara-text">
                  Career momentum
                </p>
              </div>
              <div className="rounded-full border border-green-700/20 bg-green-700/10 px-3 py-1 text-sm font-semibold text-green-800">
                On track
              </div>
            </div>
            <div className="mt-8 rounded-2xl border border-sahara-border/50 bg-sahara-surfaceLow p-5">
              <div className="h-28 rounded-xl bg-gradient-to-br from-[#fbe8d8] to-[#f4eadf]" />
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {["Portfolio", "Applications", "Interviews"].map((label, index) => (
                  <div
                    className="rounded-xl border border-sahara-border/50 bg-sahara-surface p-4"
                    key={label}
                  >
                    <p className="text-sm text-sahara-muted">{label}</p>
                    <p className="mt-3 font-serif text-3xl font-bold text-sahara-text">
                      {["72%", "14", "3"][index]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -right-4 top-1/3 hidden rounded-xl border border-sahara-border/70 bg-sahara-surface px-4 py-3 shadow-warm md:flex md:items-center md:gap-3">
              <CheckCircle2 aria-hidden="true" className="h-5 w-5 text-green-700" />
              <div>
                <p className="text-sm font-bold text-sahara-text">Offer Received</p>
                <p className="text-xs text-sahara-muted">Stripe - SWE Intern</p>
              </div>
            </div>
          </WarmCard>
        </AnimatedSection>
      </SectionContainer>

      <SectionContainer className="pt-0" id="features">
        <AnimatedSection amount={0.3} className="mx-auto mb-14 max-w-3xl text-center">
          <EditorialHeading as="h2" className="text-4xl leading-tight md:text-5xl">
            Everything you need to land the offer.
          </EditorialHeading>
          <p className="mt-5 text-lg leading-8 text-sahara-muted">
            DevLaunch replaces scattered notes and spreadsheets with a curated
            career launchpad.
          </p>
        </AnimatedSection>
        <StaggerContainer className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <StaggerItem key={feature.title}>
                <WarmCard className="h-full transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-warmHover">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#fbe8d8] text-sahara-primary">
                    <Icon aria-hidden="true" className="h-6 w-6" />
                  </div>
                  <EditorialHeading as="h3" className="text-3xl">
                    {feature.title}
                  </EditorialHeading>
                  <p className="mt-4 leading-7 text-sahara-muted">
                    {feature.description}
                  </p>
                </WarmCard>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </SectionContainer>
    </PageShell>
  );
}
