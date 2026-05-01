"use client";

import {
  ExternalLink,
  Github,
  Globe,
  Linkedin,
  Mail,
  MapPin
} from "lucide-react";
import Link from "next/link";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { StaggerContainer, StaggerItem } from "@/components/shared/AnimatedList";
import { EditorialHeading } from "@/components/shared/EditorialHeading";
import { PageShell } from "@/components/shared/PageShell";
import { WarmCard } from "@/components/shared/WarmCard";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { buttonVariants } from "@/components/ui/button";
import { type Portfolio } from "@/types/portfolio";
import { type Project } from "@/types/project";
import { type AppUser } from "@/types/user";

type PublicPortfolioProps = {
  portfolio: Portfolio;
  projects: Project[];
  user: AppUser;
  username: string;
};

type ContactLink = {
  href: string;
  label: string;
  icon: typeof Github;
  external?: boolean;
};

function safeExternalUrl(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  try {
    const url = new URL(trimmedValue);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return url.href;
  } catch {
    return null;
  }
}

function getInitials(name: string) {
  const initials = name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2);

  return initials || "DL";
}

function ContactLinks({ portfolio }: { portfolio: Portfolio }) {
  const links: ContactLink[] = [];
  const githubUrl = safeExternalUrl(portfolio.githubUrl);
  const linkedinUrl = safeExternalUrl(portfolio.linkedinUrl);
  const websiteUrl = safeExternalUrl(portfolio.websiteUrl);
  const email = portfolio.email.trim();

  if (email) {
    links.push({
      href: `mailto:${email}`,
      label: "Email",
      icon: Mail
    });
  }

  if (githubUrl) {
    links.push({
      href: githubUrl,
      label: "GitHub",
      icon: Github,
      external: true
    });
  }

  if (linkedinUrl) {
    links.push({
      href: linkedinUrl,
      label: "LinkedIn",
      icon: Linkedin,
      external: true
    });
  }

  if (websiteUrl) {
    links.push({
      href: websiteUrl,
      label: "Website",
      icon: Globe,
      external: true
    });
  }

  if (!links.length) {
    return (
      <p className="text-sm leading-7 text-sahara-muted">
        Contact links have not been added yet.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {links.map((link) => {
        const Icon = link.icon;

        return (
          <a
            className="inline-flex items-center gap-2 rounded-lg border border-sahara-border/70 bg-sahara-background px-4 py-2.5 text-sm font-semibold text-sahara-text transition hover:-translate-y-0.5 hover:border-sahara-primary/40 hover:text-sahara-primary motion-reduce:transform-none"
            href={link.href}
            key={link.label}
            rel={link.external ? "noopener noreferrer" : undefined}
            target={link.external ? "_blank" : undefined}
          >
            <Icon aria-hidden="true" className="h-4 w-4" />
            {link.label}
            {link.external ? (
              <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
            ) : null}
          </a>
        );
      })}
    </div>
  );
}

function SkillBadge({ skill }: { skill: string }) {
  return (
    <span className="rounded-full border border-sahara-border/70 bg-sahara-background px-3 py-1 text-xs font-semibold text-sahara-muted">
      {skill}
    </span>
  );
}

export function PublicPortfolio({
  portfolio,
  projects,
  user,
  username
}: PublicPortfolioProps) {
  const displayName = portfolio.fullName.trim() || username;

  return (
    <PageShell>
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-8 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between gap-4 border-b border-sahara-border/60 pb-5">
          <Link
            className="font-serif text-2xl font-bold tracking-tight text-sahara-primary"
            href="/"
          >
            DevLaunch
          </Link>
          <Link
            className={buttonVariants({ size: "sm", variant: "secondary" })}
            href="/login"
          >
            Build Yours
          </Link>
        </header>

        <AnimatedSection
          as="section"
          className="grid flex-1 items-center gap-12 py-16 md:grid-cols-[0.95fr_1.35fr] lg:py-24"
          y={16}
        >
          <div className="mx-auto w-full max-w-xs md:mx-0">
            {user.photoURL ? (
              <div
                aria-label={`${displayName} avatar`}
                className="aspect-square rounded-2xl border border-sahara-border/70 bg-cover bg-center shadow-warm"
                role="img"
                style={{ backgroundImage: `url(${user.photoURL})` }}
              />
            ) : (
              <div className="flex aspect-square items-center justify-center rounded-2xl border border-sahara-border/70 bg-sahara-surfaceLow font-serif text-7xl font-bold text-sahara-primary shadow-warm">
                {getInitials(displayName)}
              </div>
            )}
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-sahara-muted">
              /dev/{username}
            </p>
            <EditorialHeading className="mt-4 text-5xl leading-[0.95] md:text-7xl">
              {displayName}
            </EditorialHeading>
            <h2 className="mt-6 max-w-3xl font-serif text-3xl font-bold leading-tight text-sahara-primary md:text-4xl">
              {portfolio.headline}
            </h2>
            {portfolio.location ? (
              <p className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-sahara-muted">
                <MapPin aria-hidden="true" className="h-4 w-4 text-sahara-primary" />
                {portfolio.location}
              </p>
            ) : null}
            <p className="mt-7 max-w-2xl text-base leading-8 text-sahara-muted">
              {portfolio.bio ||
                "This developer is shaping their DevLaunch portfolio."}
            </p>
          </div>
        </AnimatedSection>

        <div className="grid gap-8 pb-16 lg:grid-cols-[1.2fr_0.8fr]">
          <AnimatedSection as="section" delay={0.08}>
            <WarmCard>
              <p className="text-sm font-semibold uppercase tracking-wide text-sahara-muted">
                About
              </p>
              <EditorialHeading as="h2" className="mt-3 text-4xl">
                Developer profile
              </EditorialHeading>
              <p className="mt-5 text-sm leading-7 text-sahara-muted">
                {portfolio.bio ||
                  "A concise professional story will appear here as this portfolio grows."}
              </p>
            </WarmCard>
          </AnimatedSection>

          <AnimatedSection as="section" delay={0.14}>
            <WarmCard tone="low">
              <p className="text-sm font-semibold uppercase tracking-wide text-sahara-muted">
                Contact
              </p>
              <EditorialHeading as="h2" className="mt-3 text-3xl">
                Connect
              </EditorialHeading>
              <div className="mt-6">
                <ContactLinks portfolio={portfolio} />
              </div>
            </WarmCard>
          </AnimatedSection>

          <AnimatedSection as="section" delay={0.18}>
            <WarmCard>
              <p className="text-sm font-semibold uppercase tracking-wide text-sahara-muted">
                Skills
              </p>
              <EditorialHeading as="h2" className="mt-3 text-4xl">
                Tools and strengths
              </EditorialHeading>
              {portfolio.skills.length ? (
                <StaggerContainer
                  className="mt-6 flex flex-wrap gap-2"
                  staggerDelay={0.04}
                >
                  {portfolio.skills.map((skill) => (
                    <StaggerItem key={skill} y={8}>
                      <SkillBadge skill={skill} />
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              ) : (
                <p className="mt-5 text-sm leading-7 text-sahara-muted">
                  Skills will appear here once added by the portfolio owner.
                </p>
              )}
            </WarmCard>
          </AnimatedSection>

          <AnimatedSection as="section" className="lg:col-span-2" delay={0.22}>
            <div className="mb-5 border-b border-sahara-border/60 pb-4">
              <p className="text-sm font-semibold uppercase tracking-wide text-sahara-muted">
                Projects
              </p>
              <EditorialHeading as="h2" className="mt-2 text-4xl">
                Selected work
              </EditorialHeading>
            </div>
            {projects.length ? (
              <StaggerContainer
                className="grid gap-6 md:grid-cols-2"
                staggerDelay={0.06}
              >
                {projects.map((project) => (
                  <StaggerItem key={project.id} y={10}>
                    <ProjectCard mode="public" project={project} />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            ) : (
              <WarmCard tone="low">
                <EditorialHeading as="h3" className="text-3xl">
                  Projects coming soon
                </EditorialHeading>
                <p className="mt-4 text-sm leading-7 text-sahara-muted">
                  This developer has not published projects to their portfolio yet.
                </p>
              </WarmCard>
            )}
          </AnimatedSection>
        </div>
      </div>
    </PageShell>
  );
}
