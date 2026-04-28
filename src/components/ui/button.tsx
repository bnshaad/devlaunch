import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "default" | "sm" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-sahara-primary text-white shadow-warm hover:-translate-y-0.5 hover:bg-sahara-primaryDark focus-visible:ring-sahara-primary/40",
  secondary:
    "border border-sahara-border/80 bg-transparent text-sahara-text hover:-translate-y-0.5 hover:bg-sahara-surfaceLow focus-visible:ring-sahara-primary/40",
  ghost:
    "text-sahara-muted hover:bg-sahara-surfaceLow hover:text-sahara-text focus-visible:ring-sahara-primary/40"
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "h-11 px-5 py-2",
  sm: "h-9 px-4 text-sm",
  lg: "h-12 px-6 text-base"
};

export function buttonVariants({
  variant = "primary",
  size = "default",
  className
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-sahara-background disabled:pointer-events-none disabled:opacity-50",
    variantClasses[variant],
    sizeClasses[size],
    className
  );
}

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  className,
  variant,
  size,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonVariants({ variant, size, className })}
      type={type}
      {...props}
    />
  );
}
