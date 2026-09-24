"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring
} from "framer-motion";
import { ExternalLink } from "lucide-react";
import { useCallback, useRef, type ReactNode } from "react";
import { useCanHover } from "@/lib/useCanHover";

type MagneticLinkProps = {
  href: string;
  label: string;
  icon: ReactNode;
  external?: boolean;
};

export function MagneticLink({
  href,
  label,
  icon,
  external
}: MagneticLinkProps) {
  const reduceMotion = useReducedMotion();
  const canHover = useCanHover();
  const ref = useRef<HTMLAnchorElement>(null);

  const x = useSpring(useMotionValue(0), { stiffness: 300, damping: 20 });
  const y = useSpring(useMotionValue(0), { stiffness: 300, damping: 20 });

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (reduceMotion || !canHover) return;
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (event.clientX - centerX) * 0.15;
      const deltaY = (event.clientY - centerY) * 0.15;

      x.set(deltaX);
      y.set(deltaY);
    },
    [x, y, reduceMotion, canHover]
  );

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  if (reduceMotion || !canHover) {
    return (
      <a
        className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-sahara-border/70 bg-sahara-background px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold text-sahara-text transition hover:border-sahara-primary/40 hover:text-sahara-primary active:bg-sahara-surfaceLow/60 motion-reduce:transform-none"
        href={href}
        rel={external ? "noopener noreferrer" : undefined}
        target={external ? "_blank" : undefined}
      >
        <span className="shrink-0">{icon}</span>
        <span>{label}</span>
        {external ? (
          <ExternalLink aria-hidden="true" className="h-3 w-3 sm:h-3.5 sm:w-3.5 opacity-60" />
        ) : null}
      </a>
    );
  }

  return (
    <motion.a
      className="group inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-sahara-border/70 bg-sahara-background px-4 py-2.5 text-sm font-semibold text-sahara-text transition-colors hover:border-sahara-primary/40 hover:text-sahara-primary active:scale-95"
      href={href}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      ref={ref}
      rel={external ? "noopener noreferrer" : undefined}
      style={{ x, y }}
      target={external ? "_blank" : undefined}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
    >
      <motion.span
        className="inline-flex shrink-0"
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        whileHover={{ rotate: 12, scale: 1.1 }}
      >
        {icon}
      </motion.span>
      <span>{label}</span>
      {external ? (
        <ExternalLink
          aria-hidden="true"
          className="h-3.5 w-3.5 opacity-50 transition-opacity group-hover:opacity-100"
        />
      ) : null}
    </motion.a>
  );
}
