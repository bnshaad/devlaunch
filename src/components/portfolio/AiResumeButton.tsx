"use client";

import { Sparkles } from "lucide-react";
import { type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type AiResumeButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "subtle";
};

export function AiResumeButton({
  children = "Autofill with AI",
  className,
  variant = "primary",
  ...props
}: AiResumeButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "group relative inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sahara-primary/30 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed",
        variant === "primary" &&
          "bg-sahara-primary hover:bg-sahara-primaryDark text-white px-4 py-2.5 shadow-warm hover:shadow-md text-sm",
        variant === "secondary" &&
          "border border-sahara-primary/40 bg-sahara-primary/10 hover:bg-sahara-primary/15 text-sahara-primary px-4 py-2 text-sm",
        variant === "subtle" &&
          "text-sahara-primary hover:text-sahara-primaryDark bg-sahara-surface hover:bg-sahara-surfaceLow border border-sahara-border/80 px-3 py-1.5 text-xs font-semibold",
        className
      )}
      {...props}
    >
      <Sparkles
        aria-hidden="true"
        className={cn(
          "h-4 w-4 transition-transform duration-300 group-hover:scale-110",
          variant === "primary" ? "text-amber-200" : "text-sahara-primary"
        )}
      />
      <span>{children}</span>
    </button>
  );
}
