"use client";

import { motion, useScroll, useSpring, useReducedMotion } from "framer-motion";

export function ScrollProgressBar() {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001
  });

  if (reduceMotion) {
    return null;
  }

  return (
    <motion.div
      className="fixed left-0 right-0 top-0 z-50 h-[3px] origin-left"
      style={{
        scaleX,
        background:
          "linear-gradient(90deg, #c2652a 0%, #e8955c 50%, #c2652a 100%)"
      }}
    />
  );
}
