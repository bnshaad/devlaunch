import Link from "next/link";
import { Rocket } from "lucide-react";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { EditorialHeading } from "@/components/shared/EditorialHeading";
import { PageShell } from "@/components/shared/PageShell";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { WarmCard } from "@/components/shared/WarmCard";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <PageShell>
      <SiteHeader minimal />
      <div className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-14">
        <AnimatedSection className="relative w-full max-w-md">
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
            <Button className="mt-8 w-full" size="lg">
              <span
                aria-hidden="true"
                className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-sahara-primary"
              >
                G
              </span>
              Continue with Google
            </Button>
            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-sahara-border/70" />
              <span className="text-xs font-semibold uppercase tracking-wide text-sahara-muted">
                Day 1 placeholder
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
