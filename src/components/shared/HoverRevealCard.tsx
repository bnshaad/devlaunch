"use client";

import { motion, useReducedMotion } from "framer-motion";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type HoverRevealCardProps = {
  children: ReactNode;
  reveal: ReactNode;
  className?: string;
  revealClassName?: string;
};

export function HoverRevealCard({
  children,
  reveal,
  className,
  revealClassName
}: HoverRevealCardProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      className={cn(
        "group h-full rounded-2xl border border-sahara-border/60 bg-sahara-surface p-7 text-sahara-text shadow-warm outline-none transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:ring-sahara-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-sahara-background sm:p-8",
        className
      )}
      tabIndex={0}
      transition={{ duration: 0.22, ease: "easeOut" }}
      whileFocus={reduceMotion ? undefined : { y: -2 }}
      whileHover={reduceMotion ? undefined : { y: -3 }}
    >
      {children}
      <div
        className={cn(
          "mt-5 border-t border-sahara-border/60 pt-4 text-sm leading-6 text-sahara-muted md:min-h-[4.5rem] md:translate-y-2 md:opacity-0 md:transition-all md:duration-300 md:ease-out md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100 md:group-focus-visible:translate-y-0 md:group-focus-visible:opacity-100 motion-reduce:translate-y-0 motion-reduce:transition-none",
          revealClassName
        )}
      >
        {reveal}
      </div>
    </motion.article>
  );
}
