"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

type TypewriterTextProps = {
  text: string;
  className?: string;
  speed?: number;
  delay?: number;
};

export function TypewriterText({
  text,
  className,
  speed = 40,
  delay = 600
}: TypewriterTextProps) {
  const reduceMotion = useReducedMotion();
  const [displayedCount, setDisplayedCount] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    const startTimeout = setTimeout(() => {
      let current = 0;

      const interval = setInterval(() => {
        current += 1;
        setDisplayedCount(current);

        if (current >= text.length) {
          clearInterval(interval);
          setTimeout(() => setShowCursor(false), 1200);
        }
      }, speed);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [text, speed, delay, reduceMotion]);

  const count = reduceMotion ? text.length : displayedCount;
  const cursorVisible = reduceMotion ? false : showCursor;

  return (
    <span className={className}>
      {/* Full text always in DOM for SEO — typewriter only controls visibility */}
      <span aria-hidden="true" className="whitespace-pre-wrap">
        {text.split("").map((char, index) => (
          <motion.span
            animate={{ opacity: index < count ? 1 : 0 }}
            initial={{ opacity: reduceMotion ? 1 : 0 }}
            key={`${index}-${char}`}
            transition={{ duration: 0.05 }}
          >
            {char}
          </motion.span>
        ))}
      </span>
      {cursorVisible ? (
        <span className="animate-sahara-cursor ml-0.5 inline-block h-[0.9em] w-[2.5px] sm:w-[3px] translate-y-[2px] rounded-full bg-sahara-primary" />
      ) : null}
      {/* Screen-reader-only full text */}
      <span className="sr-only">{text}</span>
    </span>
  );
}
