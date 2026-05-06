import Link from "next/link";
import {
  BarChart3,
  BriefcaseBusiness,
  FolderOpen,
  UserRound
} from "lucide-react";
import { StaggerContainer, StaggerItem } from "@/components/shared/AnimatedList";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { EditorialHeading } from "@/components/shared/EditorialHeading";
import { HoverRevealCard } from "@/components/shared/HoverRevealCard";
import { PageShell } from "@/components/shared/PageShell";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { WarmCard } from "@/components/shared/WarmCard";
import { buttonVariants } from "@/components/ui/button";

const demoItems = [
  {
    label: "Portfolio builder",
    value: "Live",
    reveal: "Authenticated users can edit headline, bio, links, visibility, and skills.",
    icon: UserRound,
    color: "text-sahara-primary"
  },
  {
    label: "Project management",
    value: "Live",
    reveal: "Projects can be added, edited, deleted, and shown on public portfolios.",
    icon: FolderOpen,
    color: "text-sahara-primary"
  },
  {
    label: "Internship tracker",
    value: "Live",
    reveal: "Applications can be saved, edited, deleted, and tracked by status.",
    icon: BriefcaseBusiness,
    color: "text-sahara-tertiary"
  },
  {
    label: "Dashboard overview",
    value: "Live",
    reveal: "The dashboard summarizes portfolio status, projects, applications, and pipeline progress.",
    icon: BarChart3,
    color: "text-amber-700"
  }
];

export default function DemoPage() {
  return (
    <PageShell>
      <SiteHeader />
      <SectionContainer className="py-10 sm:py-14">
        <AnimatedSection className="mb-10 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-sahara-muted">
            Product demo
          </p>
          <EditorialHeading className="mt-3 text-4xl leading-tight sm:text-5xl">
            A quick look at the DevLaunch workspace
          </EditorialHeading>
          <p className="mt-4 text-lg leading-8 text-sahara-muted">
            DevLaunch now includes Google sign-in, username onboarding,
            portfolio editing, public portfolio pages, project management,
            internship tracking, and a user-specific dashboard overview.
          </p>
        </AnimatedSection>

        <StaggerContainer className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {demoItems.map((item) => {
            const Icon = item.icon;

            return (
              <StaggerItem key={item.label} y={12}>
                <HoverRevealCard reveal={item.reveal}>
                  <Icon aria-hidden="true" className={`h-6 w-6 ${item.color}`} />
                  <p className="mt-5 text-sm font-medium text-sahara-muted">
                    {item.label}
                  </p>
                  <p className="mt-2 font-serif text-3xl font-bold text-sahara-text">
                    {item.value}
                  </p>
                </HoverRevealCard>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        <AnimatedSection delay={0.18}>
          <WarmCard className="mt-6">
            <EditorialHeading as="h2" className="text-3xl">
              What is live now
            </EditorialHeading>
            <p className="mt-3 max-w-2xl leading-7 text-sahara-muted">
              Sign in with Google, claim a username, build your portfolio, add
              projects, track internship applications, and share your public
              /dev/username page. This page stays static so visitors can preview
              the product before entering the live workspace.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/login" className={buttonVariants()}>
                Get Started
              </Link>
              <Link
                href="/dashboard"
                className={buttonVariants({ variant: "secondary" })}
              >
                Open Dashboard
              </Link>
            </div>
          </WarmCard>
        </AnimatedSection>
      </SectionContainer>
    </PageShell>
  );
}
