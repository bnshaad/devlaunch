import { type LucideIcon } from "lucide-react";
import { HoverRevealCard } from "@/components/shared/HoverRevealCard";
import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  accentClassName?: string;
};

export function StatCard({
  title,
  value,
  detail,
  icon: Icon,
  accentClassName
}: StatCardProps) {
  return (
    <HoverRevealCard
      className="p-6"
      reveal={
        <span>
          Open the related workspace to keep this number moving without losing
          the weekly thread.
        </span>
      }
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-sahara-muted">{title}</p>
          <p className="mt-4 font-serif text-4xl font-bold tracking-tight text-sahara-text">
            {value}
          </p>
          <p className="mt-2 text-sm leading-6 text-sahara-muted">{detail}</p>
        </div>
        <div
          className={cn(
            "rounded-lg border border-sahara-border/60 bg-sahara-surfaceLow p-3 text-sahara-primary",
            accentClassName
          )}
        >
          <Icon aria-hidden="true" className="h-5 w-5" />
        </div>
      </div>
    </HoverRevealCard>
  );
}
