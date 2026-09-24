"use client";

import {
  Github,
  Globe,
  Linkedin,
  Mail,
  MapPin,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { EditorialHeading } from "@/components/shared/EditorialHeading";
import { PageShell } from "@/components/shared/PageShell";
import { WarmCard } from "@/components/shared/WarmCard";
import { buttonVariants } from "@/components/ui/button";
import { type Portfolio } from "@/types/portfolio";
import { type Project } from "@/types/project";
import { type AppUser } from "@/types/user";
import {
  CopyLinkButton,
  FloatingCTA,
  Hero3DVisual,
  InteractiveSkillBadge,
  MagneticLink,
  ParallaxAvatar,
  PortfolioFooter,
  ScrollProgressBar,
  SectionNavDots,
  SkillCounter,
  TiltProjectCard,
  TypewriterText
} from "@/components/portfolio/interactive";

type PublicPortfolioProps = {
  portfolio: Portfolio;
  projects: Project[];
  user: AppUser;
  username: string;
};

const SECTIONS = [
  { id: "hero", label: "Intro" },
  { id: "about", label: "About" },
  { id: "contact", label: "Connect" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" }
];

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
  const links: {
    href: string;
    label: string;
    icon: React.ReactNode;
    external?: boolean;
  }[] = [];

  const githubUrl = safeExternalUrl(portfolio.githubUrl);
  const linkedinUrl = safeExternalUrl(portfolio.linkedinUrl);
  const websiteUrl = safeExternalUrl(portfolio.websiteUrl);
  const email = portfolio.email.trim();

  if (email) {
    links.push({
      href: `mailto:${email}`,
      label: "Email",
      icon: <Mail aria-hidden="true" className="h-4 w-4" />
    });
  }

  if (githubUrl) {
    links.push({
      href: githubUrl,
      label: "GitHub",
      icon: <Github aria-hidden="true" className="h-4 w-4" />,
      external: true
    });
  }

  if (linkedinUrl) {
    links.push({
      href: linkedinUrl,
      label: "LinkedIn",
      icon: <Linkedin aria-hidden="true" className="h-4 w-4" />,
      external: true
    });
  }

  if (websiteUrl) {
    links.push({
      href: websiteUrl,
      label: "Website",
      icon: <Globe aria-hidden="true" className="h-4 w-4" />,
      external: true
    });
  }

  if (!links.length) {
    return (
      <p className="text-xs sm:text-sm leading-6 sm:leading-7 text-sahara-muted">
        Contact links have not been added yet.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2.5 sm:gap-3">
      {links.map((link) => (
        <MagneticLink
          external={link.external}
          href={link.href}
          icon={link.icon}
          key={link.label}
          label={link.label}
        />
      ))}
    </div>
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
      {/* Scroll progress bar indicator at top */}
      <ScrollProgressBar />

      {/* Floating Section Navigation Dots for Desktop */}
      <SectionNavDots sections={SECTIONS} />

      {/* Persistent Floating 'Build Yours' CTA */}
      <FloatingCTA />

      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-5 sm:px-8 sm:py-8 lg:px-10">
        {/* Navigation header */}
        <header className="flex items-center justify-between gap-3 border-b border-sahara-border/60 pb-4 sm:pb-5">
          <Link
            className="flex items-center gap-2 font-serif text-xl sm:text-2xl font-bold tracking-tight text-sahara-primary transition-opacity hover:opacity-90"
            href="/"
          >
            <span>DevLaunch</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <CopyLinkButton username={username} />
            <Link
              className={`${buttonVariants({ size: "sm", variant: "primary" })} min-h-[44px] px-3.5 sm:px-4 text-xs sm:text-sm`}
              href="/login"
            >
              Build Yours
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <AnimatedSection
          as="section"
          className="relative grid flex-1 items-center gap-6 sm:gap-8 md:gap-12 py-8 sm:py-12 md:py-16 lg:py-24 md:grid-cols-[0.95fr_1.35fr]"
          id="hero"
          y={16}
        >
          {/* Subtle interactive 3D geometric background */}
          <Hero3DVisual />

          {/* 3D Parallax Avatar */}
          <div className="relative z-10 mx-auto w-full max-w-[190px] sm:max-w-[240px] md:max-w-xs md:mx-0">
            <ParallaxAvatar
              alt={`${displayName} avatar`}
              initials={getInitials(displayName)}
              src={user.photoURL || null}
            />
          </div>

          {/* Developer identity details */}
          <div className="relative z-10 text-center md:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-sahara-border/70 bg-sahara-surface/85 px-3 py-1 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-sahara-muted shadow-sm backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sahara-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-sahara-primary" />
              </span>
              /dev/{username}
            </div>

            <EditorialHeading className="mt-3 sm:mt-4 text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] sm:leading-[0.95] break-words">
              {displayName}
            </EditorialHeading>

            <h2 className="mt-3 sm:mt-5 max-w-3xl font-serif text-2xl sm:text-3xl md:text-4xl font-bold leading-tight text-sahara-primary">
              <TypewriterText text={portfolio.headline} />
            </h2>

            {portfolio.location ? (
              <p className="mt-3 sm:mt-5 inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-sahara-muted">
                <MapPin aria-hidden="true" className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-sahara-primary" />
                {portfolio.location}
              </p>
            ) : null}

            <p className="mt-4 sm:mt-6 max-w-2xl text-sm sm:text-base leading-6 sm:leading-8 text-sahara-muted mx-auto md:mx-0">
              {portfolio.bio ||
                "This developer is shaping their DevLaunch portfolio."}
            </p>

            <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center md:justify-start gap-2.5 sm:gap-3">
              <a
                className={`${buttonVariants({ size: "default", variant: "primary" })} min-h-[44px] px-5 text-xs sm:text-sm flex-1 sm:flex-initial text-center justify-center`}
                href="#contact"
              >
                Get in touch
              </a>
              <div className="flex-1 sm:flex-initial">
                <CopyLinkButton username={username} />
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Content Sections Grid */}
        <div className="grid gap-6 sm:gap-8 pb-12 sm:pb-16 lg:grid-cols-[1.2fr_0.8fr]">
          {/* About Section */}
          <AnimatedSection as="section" delay={0.08} id="about">
            <WarmCard className="relative h-full overflow-hidden p-5 sm:p-7 md:p-8">
              <div className="pointer-events-none absolute right-0 top-0 h-28 w-28 sm:h-32 sm:w-32 rounded-bl-full bg-gradient-to-bl from-sahara-primary/10 to-transparent" />
              <div className="flex items-center gap-2">
                <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-sahara-muted">
                  About
                </p>
                <Sparkles className="h-3.5 w-3.5 text-sahara-primary/70" />
              </div>
              <EditorialHeading as="h2" className="mt-2 text-2xl sm:text-3xl md:text-4xl">
                Developer profile
              </EditorialHeading>
              <p className="mt-4 sm:mt-5 text-xs sm:text-sm leading-6 sm:leading-7 text-sahara-muted">
                {portfolio.bio ||
                  "A concise professional story will appear here as this portfolio grows."}
              </p>
            </WarmCard>
          </AnimatedSection>

          {/* Contact Section */}
          <AnimatedSection as="section" delay={0.12} id="contact">
            <WarmCard className="relative h-full overflow-hidden p-5 sm:p-7 md:p-8" tone="low">
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-sahara-muted">
                Contact
              </p>
              <EditorialHeading as="h2" className="mt-2 text-2xl sm:text-3xl">
                Connect
              </EditorialHeading>
              <div className="mt-5 sm:mt-6">
                <ContactLinks portfolio={portfolio} />
              </div>
            </WarmCard>
          </AnimatedSection>

          {/* Skills Section */}
          <AnimatedSection as="section" delay={0.16} id="skills">
            <WarmCard className="relative h-full overflow-hidden p-5 sm:p-7 md:p-8">
              <div className="flex items-center justify-between gap-3 sm:gap-4">
                <div>
                  <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-sahara-muted">
                    Skills
                  </p>
                  <EditorialHeading as="h2" className="mt-1 text-2xl sm:text-3xl md:text-4xl">
                    Tools & strengths
                  </EditorialHeading>
                </div>
                {portfolio.skills.length > 0 ? (
                  <SkillCounter count={portfolio.skills.length} label="mastered" />
                ) : null}
              </div>

              {portfolio.skills.length ? (
                <div className="mt-5 sm:mt-6 flex flex-wrap gap-2 sm:gap-2.5">
                  {portfolio.skills.map((skill, index) => (
                    <InteractiveSkillBadge
                      index={index}
                      key={skill}
                      skill={skill}
                      total={portfolio.skills.length}
                    />
                  ))}
                </div>
              ) : (
                <p className="mt-4 sm:mt-5 text-xs sm:text-sm leading-6 sm:leading-7 text-sahara-muted">
                  Skills will appear here once added by the portfolio owner.
                </p>
              )}
            </WarmCard>
          </AnimatedSection>

          {/* Projects Section */}
          <AnimatedSection
            as="section"
            className="lg:col-span-2"
            delay={0.2}
            id="projects"
          >
            <div className="mb-4 sm:mb-6 flex flex-wrap items-end justify-between gap-2 border-b border-sahara-border/60 pb-3 sm:pb-4">
              <div>
                <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-sahara-muted">
                  Projects
                </p>
                <EditorialHeading as="h2" className="mt-1 text-2xl sm:text-3xl md:text-4xl">
                  Selected work
                </EditorialHeading>
              </div>
              {projects.length > 0 ? (
                <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-sahara-muted">
                  {projects.length} {projects.length === 1 ? "project" : "projects"}{" "}
                  showcase
                </span>
              ) : null}
            </div>

            {projects.length ? (
              <div className="grid gap-5 sm:gap-6 md:grid-cols-2">
                {projects.map((project) => (
                  <TiltProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <WarmCard className="p-5 sm:p-7 md:p-8" tone="low">
                <EditorialHeading as="h3" className="text-2xl sm:text-3xl">
                  Projects coming soon
                </EditorialHeading>
                <p className="mt-3 sm:mt-4 text-xs sm:text-sm leading-6 sm:leading-7 text-sahara-muted">
                  This developer has not published projects to their portfolio yet.
                </p>
              </WarmCard>
            )}
          </AnimatedSection>
        </div>

        {/* Branded Footer */}
        <PortfolioFooter />
      </div>
    </PageShell>
  );
}
