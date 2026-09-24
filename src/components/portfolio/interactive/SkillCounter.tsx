"use client";

import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform
} from "framer-motion";
import { useEffect, useRef } from "react";

type SkillCounterProps = {
  count: number;
  label?: string;
};

export function SkillCounter({ count, label = "skills" }: SkillCounterProps) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const motionCount = useMotionValue(0);
  const rounded = useTransform(motionCount, (latest) => Math.round(latest));

  useEffect(() => {
    if (!isInView || reduceMotion) return;

    const controls = animate(motionCount, count, {
      duration: 1.2,
      ease: "easeOut"
    });

    return controls.stop;
  }, [isInView, count, motionCount, reduceMotion]);

  if (reduceMotion) {
    return (
      <span className="font-serif text-3xl sm:text-4xl font-bold text-sahara-primary" ref={ref}>
        {count}{" "}
        <span className="text-xs sm:text-base font-normal text-sahara-muted">{label}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-baseline gap-1.5 sm:gap-2" ref={ref}>
      <motion.span className="font-serif text-3xl sm:text-4xl font-bold text-sahara-primary">
        {rounded}
      </motion.span>
      <span className="text-xs sm:text-base font-normal text-sahara-muted">{label}</span>
    </span>
  );
}
