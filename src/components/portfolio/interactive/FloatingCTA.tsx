"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useMotionValueEvent
} from "framer-motion";
import { Rocket } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function FloatingCTA() {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setVisible(latest > 0.12 && latest < 0.94);
  });

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          animate={reduceMotion ? {} : { opacity: 1, y: 0, scale: 1 }}
          className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] right-4 z-40 sm:bottom-8 sm:right-8"
          exit={reduceMotion ? {} : { opacity: 0, y: 16, scale: 0.9 }}
          initial={reduceMotion ? {} : { opacity: 0, y: 16, scale: 0.9 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <Link
            className="group flex min-h-[44px] items-center gap-2 rounded-full bg-gradient-to-r from-sahara-primary to-sahara-primaryDark px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-sahara-primary/30 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-sahara-primary/40 active:scale-95 motion-reduce:transform-none"
            href="/login"
          >
            <Rocket
              aria-hidden="true"
              className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:-rotate-12 motion-reduce:transform-none"
            />
            <span>Build Yours</span>
          </Link>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
