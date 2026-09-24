"use client";

import { Rocket } from "lucide-react";
import Link from "next/link";
import { AnimatedSection } from "@/components/shared/AnimatedSection";

export function PortfolioFooter() {
  return (
    <AnimatedSection as="section" delay={0.2}>
      <footer className="border-t border-sahara-border/40 pb-[calc(3rem+env(safe-area-inset-bottom,0px))] pt-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-4 sm:flex-row sm:justify-between sm:px-8 lg:px-10">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm text-sahara-muted">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-sahara-primary to-sahara-primaryDark shadow-sm">
              <Rocket aria-hidden="true" className="h-3.5 w-3.5 text-white" />
            </div>
            <span>
              Built with{" "}
              <Link
                className="font-semibold text-sahara-primary transition-colors hover:text-sahara-primaryDark"
                href="/"
              >
                DevLaunch
              </Link>
            </span>
          </div>
          <Link
            className="group inline-flex min-h-[44px] w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-sahara-primary/30 bg-sahara-primary/5 px-5 py-2.5 text-xs sm:text-sm font-semibold text-sahara-primary transition-all hover:-translate-y-0.5 hover:border-sahara-primary/50 hover:bg-sahara-primary/10 hover:shadow-warm active:scale-[0.98] motion-reduce:transform-none"
            href="/login"
          >
            <span>Build yours for free</span>
            <span className="transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none">
              →
            </span>
          </Link>
        </div>
      </footer>
    </AnimatedSection>
  );
}
