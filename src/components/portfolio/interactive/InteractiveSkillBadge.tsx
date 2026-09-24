"use client";

import { motion, useReducedMotion } from "framer-motion";

type InteractiveSkillBadgeProps = {
  skill: string;
  index: number;
  total?: number;
};

/* Rotating accent tints derived from Sahara palette */
const ACCENT_COLORS = [
  { bg: "rgba(194, 101, 42, 0.08)", border: "rgba(194, 101, 42, 0.25)", glow: "rgba(194, 101, 42, 0.2)" },
  { bg: "rgba(140, 60, 60, 0.08)", border: "rgba(140, 60, 60, 0.25)", glow: "rgba(140, 60, 60, 0.2)" },
  { bg: "rgba(119, 107, 97, 0.08)", border: "rgba(119, 107, 97, 0.25)", glow: "rgba(119, 107, 97, 0.2)" },
  { bg: "rgba(169, 84, 34, 0.08)", border: "rgba(169, 84, 34, 0.25)", glow: "rgba(169, 84, 34, 0.2)" }
];

export function InteractiveSkillBadge({
  skill,
  index,
  total
}: InteractiveSkillBadgeProps) {
  const reduceMotion = useReducedMotion();
  const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];
  const rankLabel = total ? `${index + 1} of ${total}` : `${index + 1}`;

  if (reduceMotion) {
    return (
      <span className="rounded-full border border-sahara-border/70 bg-sahara-background px-3 py-1.5 text-xs font-semibold text-sahara-muted">
        {skill}
      </span>
    );
  }

  return (
    <motion.span
      aria-label={`${skill} (Rank ${rankLabel})`}
      className="group relative cursor-default rounded-full border px-3 sm:px-3.5 py-1.5 text-xs font-semibold text-sahara-text transition-colors duration-200 select-none active:scale-95"
      style={{
        backgroundColor: accent.bg,
        borderColor: accent.border
      }}
      transition={{ type: "spring", stiffness: 400, damping: 18 }}
      whileHover={{
        scale: 1.08,
        boxShadow: `0 0 14px 2px ${accent.glow}`,
        y: -2
      }}
      whileTap={{ scale: 0.95 }}
    >
      {skill}
      {/* Rank indicator on hover */}
      <span className="pointer-events-none absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-sahara-primary text-[9px] font-bold text-white opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100">
        {index + 1}
      </span>
    </motion.span>
  );
}
