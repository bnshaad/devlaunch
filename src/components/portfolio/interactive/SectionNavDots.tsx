"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Section = {
  id: string;
  label: string;
};

type SectionNavDotsProps = {
  sections: Section[];
};

export function SectionNavDots({ sections }: SectionNavDotsProps) {
  const reduceMotion = useReducedMotion();
  const [activeId, setActiveId] = useState<string>(sections[0]?.id || "");

  useEffect(() => {
    if (typeof window === "undefined" || !sections.length) return;

    const visibleRatios: Record<string, number> = {};

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visibleRatios[entry.target.id] = entry.intersectionRatio;
        });

        let highestRatio = 0;
        let mostVisibleId = activeId;

        for (const section of sections) {
          const ratio = visibleRatios[section.id] || 0;
          if (ratio > highestRatio) {
            highestRatio = ratio;
            mostVisibleId = section.id;
          }
        }

        if (highestRatio > 0.05) {
          setActiveId(mostVisibleId);
        }
      },
      {
        root: null,
        rootMargin: "-15% 0px -40% 0px",
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0]
      }
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections, activeId]);

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    }
  };

  return (
    <nav
      aria-label="Section navigation"
      className="fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-3.5 rounded-full border border-sahara-border/70 bg-sahara-surface/85 p-2 backdrop-blur-md shadow-warm lg:flex"
    >
      {sections.map((section) => {
        const isActive = activeId === section.id;
        return (
          <button
            aria-label={`Scroll to ${section.label}`}
            className="group relative flex items-center justify-center p-1.5 focus:outline-none"
            key={section.id}
            onClick={() => handleScrollTo(section.id)}
            type="button"
          >
            {/* Tooltip on hover */}
            <span
              className={cn(
                "pointer-events-none absolute right-8 whitespace-nowrap rounded-md bg-sahara-text px-2.5 py-1 text-xs font-semibold text-sahara-background opacity-0 shadow-md transition-all duration-200 group-hover:opacity-100 group-hover:-translate-x-1",
                "motion-reduce:transform-none"
              )}
            >
              {section.label}
            </span>

            {/* Dot indicator */}
            <motion.div
              animate={{
                scale: isActive ? 1.3 : 1,
                backgroundColor: isActive ? "#c2652a" : "#776b61"
              }}
              className={cn(
                "h-2 w-2 rounded-full transition-colors",
                isActive ? "opacity-100" : "opacity-40 group-hover:opacity-80"
              )}
              transition={{ duration: 0.2 }}
            />

            {/* Active glowing ring */}
            {isActive ? (
              <motion.div
                className="absolute inset-0 rounded-full border border-sahara-primary/50"
                initial={reduceMotion ? {} : { scale: 0.6, opacity: 0 }}
                animate={reduceMotion ? {} : { scale: 1.1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 350, damping: 20 }}
              />
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}
