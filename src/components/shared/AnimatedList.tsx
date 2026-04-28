"use client";

import { motion, useReducedMotion } from "framer-motion";
import { type ReactNode } from "react";

type StaggerContainerProps = {
  children: ReactNode;
  className?: string;
  amount?: number;
  staggerDelay?: number;
};

export function StaggerContainer({
  children,
  className,
  amount = 0.18,
  staggerDelay = 0.08
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
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={{
        hidden: reduceMotion ? {} : { opacity: 0, y: 14 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.46, ease: "easeOut" }
        }
      }}
    >
      {children}
    </motion.div>
  );
}

export const AnimatedList = StaggerContainer;
export const AnimatedListItem = StaggerItem;
