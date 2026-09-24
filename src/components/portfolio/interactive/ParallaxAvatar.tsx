"use client";

/* eslint-disable @next/next/no-img-element */

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform
} from "framer-motion";
import { Sparkles } from "lucide-react";
import { useCallback, useRef } from "react";
import { useCanHover } from "@/lib/useCanHover";

type ParallaxAvatarProps = {
  src: string | null;
  alt: string;
  initials: string;
};

export function ParallaxAvatar({ src, alt, initials }: ParallaxAvatarProps) {
  const reduceMotion = useReducedMotion();
  const canHover = useCanHover();
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), {
    stiffness: 180,
    damping: 22
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), {
    stiffness: 180,
    damping: 22
  });

  // Inverse shadow transform for realistic hovering elevation
  const shadowX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), {
    stiffness: 180,
    damping: 22
  });
  const shadowY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-12, 12]), {
    stiffness: 180,
    damping: 22
  });

  const glowX = useTransform(mouseX, [-0.5, 0.5], [20, 80]);
  const glowY = useTransform(mouseY, [-0.5, 0.5], [20, 80]);

  // Hook called unconditionally at top level
  const glowBackground = useTransform(
    [glowX, glowY],
    ([x, y]) =>
      `radial-gradient(circle 280px at ${x}% ${y}%, rgba(255, 255, 255, 0.28) 0%, rgba(194, 101, 42, 0.08) 40%, transparent 70%)`
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (reduceMotion || !canHover) return;
      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const normalizedX = (event.clientX - rect.left) / rect.width - 0.5;
      const normalizedY = (event.clientY - rect.top) / rect.height - 0.5;

      mouseX.set(normalizedX);
      mouseY.set(normalizedY);
    },
    [mouseX, mouseY, reduceMotion, canHover]
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  const avatarContent = src ? (
    <img
      alt={alt}
      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
      referrerPolicy="no-referrer"
      src={src}
    />
  ) : (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sahara-surfaceLow via-sahara-surface to-[#f7eedf] font-serif text-5xl sm:text-6xl md:text-7xl font-bold text-sahara-primary">
      {initials}
    </div>
  );

  if (reduceMotion) {
    return (
      <div className="relative mx-auto w-full max-w-[190px] sm:max-w-[240px] md:max-w-xs md:mx-0">
        <div className="aspect-square overflow-hidden rounded-2xl border border-sahara-border/70 shadow-warm">
          {avatarContent}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`perspective-1000 group relative mx-auto w-full max-w-[190px] sm:max-w-[240px] md:max-w-xs select-none md:mx-0 ${
        !canHover ? "animate-sahara-float" : ""
      }`}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      ref={containerRef}
    >
      {/* Dynamic ambient 3D shadow underneath */}
      <motion.div
        className="pointer-events-none absolute -inset-2 rounded-3xl bg-sahara-primary/10 blur-xl transition-opacity duration-300 group-hover:opacity-100"
        style={{
          x: canHover ? shadowX : 0,
          y: canHover ? shadowY : 0,
          opacity: 0.6
        }}
      />

      <motion.div
        className="preserve-3d relative aspect-square rounded-2xl border border-sahara-border/70 bg-sahara-surface p-1 shadow-warm transition-shadow duration-300 group-hover:shadow-warmHover"
        style={{
          rotateX: canHover ? rotateX : 0,
          rotateY: canHover ? rotateY : 0
        }}
      >
        {/* Main avatar image container */}
        <div className="h-full w-full overflow-hidden rounded-[14px]">
          {avatarContent}
        </div>

        {/* 3D Specular lighting reflection overlay (active on desktop hover) */}
        {canHover ? (
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{ background: glowBackground }}
          />
        ) : null}

        {/* Floating 3D Badge popping out towards user */}
        <div
          className="pointer-events-none absolute -bottom-2.5 -right-2 sm:-bottom-3 sm:-right-3 flex items-center gap-1 sm:gap-1.5 rounded-full border border-sahara-border/80 bg-sahara-surface/95 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-semibold text-sahara-text shadow-lg backdrop-blur-md"
          style={{ transform: "translateZ(32px)" }}
        >
          <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="font-medium tracking-tight">Available</span>
          <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-sahara-primary" />
        </div>
      </motion.div>
    </div>
  );
}
