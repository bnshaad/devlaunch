"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform
} from "framer-motion";
import { ExternalLink, Github, Star } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { useCanHover } from "@/lib/useCanHover";
import { type Project } from "@/types/project";

type TiltProjectCardProps = {
  project: Project;
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

export function TiltProjectCard({ project }: TiltProjectCardProps) {
  const reduceMotion = useReducedMotion();
  const canHover = useCanHover();
  const cardRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [7, -7]), {
    stiffness: 220,
    damping: 24
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-7, 7]), {
    stiffness: 220,
    damping: 24
  });

  const shadowX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), {
    stiffness: 220,
    damping: 24
  });
  const shadowY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-8, 8]), {
    stiffness: 220,
    damping: 24
  });

  const glowX = useTransform(mouseX, [-0.5, 0.5], [20, 80]);
  const glowY = useTransform(mouseY, [-0.5, 0.5], [20, 80]);

  // Hook called unconditionally at top level
  const glowBackground = useTransform(
    [glowX, glowY],
    ([x, y]) =>
      `radial-gradient(circle 380px at ${x}% ${y}%, rgba(255, 255, 255, 0.22) 0%, rgba(194, 101, 42, 0.05) 50%, transparent 80%)`
  );

  const githubUrl = safeExternalUrl(project.githubUrl);
  const liveUrl = safeExternalUrl(project.liveUrl);
  const imageUrl = safeExternalUrl(project.imageUrl);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (reduceMotion || !canHover) return;
      const el = cardRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      mouseX.set((event.clientX - rect.left) / rect.width - 0.5);
      mouseY.set((event.clientY - rect.top) / rect.height - 0.5);
    },
    [mouseX, mouseY, reduceMotion, canHover]
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  const cardContent = (is3D: boolean) => (
    <>
      {imageUrl ? (
        <div
          className="relative overflow-hidden rounded-t-2xl border-b border-sahara-border/60"
          style={is3D && canHover ? { transform: "translateZ(16px)" } : undefined}
        >
          <motion.div
            className="aspect-[16/9] bg-sahara-surfaceLow bg-cover bg-center transition-transform duration-500 ease-out"
            style={{ backgroundImage: `url(${imageUrl})` }}
            whileHover={reduceMotion || !canHover ? undefined : { scale: 1.04 }}
          />
          {/* Shimmer sweep on hover for desktop */}
          {canHover ? (
            <div
              className="animate-sahara-shimmer pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{
                background:
                  "linear-gradient(90deg, transparent 30%, rgba(255,255,255,0.12) 50%, transparent 70%)",
                backgroundSize: "200% 100%"
              }}
            />
          ) : null}
        </div>
      ) : null}

      <div
        className="flex flex-1 flex-col p-5 sm:p-7"
        style={is3D && canHover ? { transformStyle: "preserve-3d" } : undefined}
      >
        <div
          className="flex items-start justify-between gap-3 sm:gap-4"
          style={is3D && canHover ? { transform: "translateZ(30px)" } : undefined}
        >
          <h3 className="font-serif text-xl sm:text-2xl font-bold leading-tight text-sahara-text">
            {project.title}
          </h3>
          {project.featured ? (
            <span
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-sahara-primary/25 bg-[#fbe8d8] px-2.5 py-0.5 sm:px-3 sm:py-1 text-xs font-semibold text-sahara-primary shadow-sm"
              style={is3D && canHover ? { transform: "translateZ(38px)" } : undefined}
            >
              <Star
                aria-hidden="true"
                className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-sahara-primary/30 text-sahara-primary"
              />
              Featured
            </span>
          ) : null}
        </div>

        <motion.div
          animate={{ height: expanded ? "auto" : "5.4rem" }}
          className="mt-3 sm:mt-4 overflow-hidden"
          initial={false}
          style={is3D && canHover ? { transform: "translateZ(18px)" } : undefined}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <p className="text-sm leading-6 sm:leading-7 text-sahara-muted">
            {project.description}
          </p>
        </motion.div>

        {project.description.length > 140 ? (
          <button
            className="mt-1 inline-flex min-h-[36px] items-center self-start text-xs font-semibold text-sahara-primary transition-colors hover:text-sahara-primaryDark"
            onClick={() => setExpanded((prev) => !prev)}
            style={is3D && canHover ? { transform: "translateZ(24px)" } : undefined}
            type="button"
          >
            {expanded ? "Show less ↑" : "Read more ↓"}
          </button>
        ) : null}

        {project.techStack.length ? (
          <div
            className="mt-4 sm:mt-5 flex flex-wrap gap-1.5 sm:gap-2"
            style={is3D && canHover ? { transform: "translateZ(26px)" } : undefined}
          >
            {project.techStack.map((tech) => (
              <span
                className="rounded-full border border-sahara-border/70 bg-sahara-background px-2.5 py-1 text-xs font-semibold text-sahara-muted transition-all hover:border-sahara-primary/30 hover:text-sahara-primary"
                key={tech}
              >
                {tech}
              </span>
            ))}
          </div>
        ) : null}

        <div
          className="mt-5 sm:mt-6 flex flex-wrap gap-2.5 sm:gap-3 pt-2"
          style={is3D && canHover ? { transform: "translateZ(36px)" } : undefined}
        >
          {githubUrl ? (
            <a
              className={`${buttonVariants({ size: "sm", variant: "secondary" })} min-h-[40px] px-3.5 text-xs sm:text-sm`}
              href={githubUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              <Github aria-hidden="true" className="h-4 w-4" />
              GitHub
            </a>
          ) : null}
          {liveUrl ? (
            <a
              className={`${buttonVariants({ size: "sm", variant: "secondary" })} min-h-[40px] px-3.5 text-xs sm:text-sm`}
              href={liveUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              <ExternalLink aria-hidden="true" className="h-4 w-4" />
              Live Demo
            </a>
          ) : null}
        </div>
      </div>
    </>
  );

  if (reduceMotion || !canHover) {
    return (
      <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-sahara-border/60 bg-sahara-surface text-sahara-text shadow-warm transition-shadow duration-200 active:shadow-warmHover">
        {cardContent(false)}
      </div>
    );
  }

  return (
    <div
      className="perspective-1000 group relative"
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      ref={cardRef}
    >
      {/* 3D ambient floating shadow */}
      <motion.div
        className="pointer-events-none absolute -inset-1 rounded-3xl bg-sahara-primary/10 blur-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          x: shadowX,
          y: shadowY
        }}
      />

      <motion.div
        className="preserve-3d relative flex h-full flex-col rounded-2xl border border-sahara-border/60 bg-sahara-surface text-sahara-text shadow-warm transition-shadow duration-300 group-hover:shadow-warmHover"
        style={{
          rotateX,
          rotateY
        }}
      >
        {cardContent(true)}

        {/* 3D Specular Light Glare Overlay */}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{ background: glowBackground }}
        />
      </motion.div>
    </div>
  );
}
