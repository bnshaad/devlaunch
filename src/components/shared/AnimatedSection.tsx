"use client";

import { motion, useReducedMotion, type MotionProps } from "framer-motion";
import { type ReactNode } from "react";

type AnimatedSectionProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  amount?: number;
  as?: "div" | "section" | "article" | "aside";
};

export function AnimatedSection({
  children,
  className,
  delay = 0,
  amount = 0.2,
  as = "div"
}: AnimatedSectionProps) {
  const reduceMotion = useReducedMotion();
  const Component = motion[as];

  const motionProps: MotionProps = reduceMotion
    ? { initial: false }
    : {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount },
        transition: { duration: 0.5, ease: "easeOut", delay }
      };

  return (
    <Component className={className} {...motionProps}>
      {children}
    </Component>
  );
}
