import Link from "next/link";
import { BarChart3, BriefcaseBusiness, CheckCircle2, UserRound } from "lucide-react";
import { StaggerContainer, StaggerItem } from "@/components/shared/AnimatedList";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { EditorialHeading } from "@/components/shared/EditorialHeading";
import { PageShell } from "@/components/shared/PageShell";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { WarmCard } from "@/components/shared/WarmCard";
import { buttonVariants } from "@/components/ui/button";

const demoItems = [
  {
    label: "Portfolio preview",
    value: "Recruiter-ready",
    icon: UserRound,
    color: "text-sahara-primary"
  },
  {
    label: "Applications tracked",
    value: "14",
    icon: BriefcaseBusiness,
    color: "text-sahara-primary"
  },
  {
    label: "Interview rate",
    value: "21%",
    icon: BarChart3,
    color: "text-amber-700"
  },
  {
    label: "Next action",
    value: "Follow up",
    icon: CheckCircle2,
    color: "text-green-700"
  }
];

export default function DemoPage() {
  return (
    <PageShell>
      <SiteHeader />
      <SectionContainer className="py-10 sm:py-14">
        <AnimatedSection className="mb-10 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-sahara-muted">
            Static demo
          </p>
          <EditorialHeading className="mt-3 text-4xl leading-tight sm:text-5xl">
            A quick look at the DevLaunch workspace
          </EditorialHeading>
          <p className="mt-4 text-lg leading-8 text-sahara-muted">
            This preview shows the career dashboard direction before Firebase
            data and Google sign-in are connected.
          </p>
        </AnimatedSection>

        <StaggerContainer className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {demoItems.map((item) => {
            const Icon = item.icon;

            return (
              <StaggerItem key={item.label}>
                <WarmCard className="h-full transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-warmHover">
                  <Icon aria-hidden="true" className={`h-6 w-6 ${item.color}`} />
                  <p className="mt-5 text-sm font-medium text-sahara-muted">
                    {item.label}
                  </p>
                  <p className="mt-2 font-serif text-3xl font-bold text-sahara-text">
                    {item.value}
                  </p>
                </WarmCard>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        <AnimatedSection delay={0.18}>
        <WarmCard className="mt-6">
          <EditorialHeading as="h2" className="text-3xl">
            What will be interactive next
          </EditorialHeading>
          <p className="mt-3 max-w-2xl leading-7 text-sahara-muted">
            Google authentication, onboarding, portfolio editing, project
            management, internship tracking, and analytics will replace these
            static examples as the MVP grows.
          </p>
          <Link
            href="/login"
            className={buttonVariants({ className: "mt-6" })}
          >
            Get Started
          </Link>
        </WarmCard>
        </AnimatedSection>
      </SectionContainer>
    </PageShell>
  );
}
