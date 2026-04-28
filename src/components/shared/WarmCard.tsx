import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type WarmCardTone = "default" | "low" | "inverse" | "primary";

const toneClasses: Record<WarmCardTone, string> = {
  default:
    "border-sahara-border/60 bg-sahara-surface text-sahara-text shadow-warm",
  low: "border-sahara-border/60 bg-sahara-surfaceLow/70 text-sahara-text",
  inverse: "border-sahara-text bg-sahara-text text-sahara-background",
  primary: "border-sahara-primary bg-sahara-primary text-white"
};

type WarmCardProps = HTMLAttributes<HTMLDivElement> & {
  tone?: WarmCardTone;
};

export function WarmCard({
  className,
  tone = "default",
  ...props
}: WarmCardProps) {
  return (
    <div
      className={cn("rounded-2xl border p-7 sm:p-8", toneClasses[tone], className)}
      {...props}
    />
  );
}
