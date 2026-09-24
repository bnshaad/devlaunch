"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Copy, Share2 } from "lucide-react";
import { useCallback, useState } from "react";

type CopyLinkButtonProps = {
  username: string;
};

export function CopyLinkButton({ username }: CopyLinkButtonProps) {
  const reduceMotion = useReducedMotion();
  const [copied, setCopied] = useState(false);

  const handleShareOrCopy = useCallback(async () => {
    const url = `${window.location.origin}/dev/${username}`;

    // Haptic feedback on mobile if supported
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(30);
      } catch {
        /* ignore */
      }
    }

    // Try native Web Share API on mobile devices first
    const isMobile =
      typeof navigator !== "undefined" &&
      /mobile|android|iphone|ipad|ipod/i.test(navigator.userAgent);

    if (isMobile && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: `${username} on DevLaunch`,
          text: `Check out ${username}'s developer portfolio on DevLaunch:`,
          url
        });
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
        return;
      } catch (err) {
        // If user cancelled native share sheet, do nothing
        if ((err as Error).name === "AbortError") {
          return;
        }
      }
    }

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = url;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }, [username]);

  return (
    <button
      aria-label="Share or copy portfolio link"
      className="group relative inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-sahara-border/70 bg-sahara-background px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-sahara-text transition-all hover:-translate-y-0.5 hover:border-sahara-primary/40 hover:text-sahara-primary active:scale-[0.98] motion-reduce:transform-none"
      onClick={handleShareOrCopy}
      type="button"
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.span
            animate={reduceMotion ? {} : { opacity: 1, scale: 1 }}
            className="flex items-center gap-1.5 text-emerald-700"
            exit={reduceMotion ? {} : { opacity: 0, scale: 0.8 }}
            initial={reduceMotion ? {} : { opacity: 0, scale: 0.8 }}
            key="copied"
            transition={{ duration: 0.2 }}
          >
            <Check aria-hidden="true" className="h-4 w-4" />
            <span>Copied!</span>
          </motion.span>
        ) : (
          <motion.span
            animate={reduceMotion ? {} : { opacity: 1, scale: 1 }}
            className="flex items-center gap-1.5"
            exit={reduceMotion ? {} : { opacity: 0, scale: 0.8 }}
            initial={reduceMotion ? {} : { opacity: 0, scale: 0.8 }}
            key="share"
            transition={{ duration: 0.2 }}
          >
            <Share2 aria-hidden="true" className="h-4 w-4 text-sahara-primary" />
            <span>Share</span>
            <Copy
              aria-hidden="true"
              className="hidden sm:inline-block h-3.5 w-3.5 opacity-50 transition-opacity group-hover:opacity-100"
            />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
