"use client";

import { motion, useReducedMotion } from "framer-motion";
import { type ReactNode } from "react";

type StaggerContainerProps = {
  children: ReactNode;
  className?: string;
  amount?: number;
  staggerDelay?: number;
  delayChildren?: number;
};

export function StaggerContainer({
  children,
  className,
  amount = 0.18,
  staggerDelay = 0.08,
  delayChildren = 0
}: StaggerContainerProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : "hidden"}
      viewport={{ once: true, amount }}
      whileInView={reduceMotion ? undefined : "show"}
      variants={{
        hidden: {},
        show: {
          transition: {
            delayChildren,
            staggerChildren: staggerDelay
          }
        }
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  y = 14,
  duration = 0.5
}: {
  children: ReactNode;
  className?: string;
  y?: number;
  duration?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={{
        hidden: reduceMotion ? {} : { opacity: 0, y },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration, ease: "easeOut" }
        }
      }}
    >
      {children}
    </motion.div>
  );
}

export const AnimatedList = StaggerContainer;
export const AnimatedListItem = StaggerItem;
