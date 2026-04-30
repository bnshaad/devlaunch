import { type ApplicationStatus } from "@/types/application";
import { cn } from "@/lib/utils";

const statusStyles: Record<ApplicationStatus, string> = {
  saved: "border-sahara-border/70 bg-sahara-background text-sahara-muted",
  applied: "border-sahara-primary/25 bg-[#fbe8d8] text-sahara-primary",
  interview: "border-amber-800/20 bg-amber-50 text-amber-800",
  offer: "border-green-700/20 bg-green-50 text-green-800",
  rejected: "border-sahara-tertiary/25 bg-sahara-tertiary/10 text-sahara-tertiary"
};

const statusLabels: Record<ApplicationStatus, string> = {
  saved: "Saved",
  applied: "Applied",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected"
};

export function ApplicationStatusBadge({
  className,
  status
}: {
  className?: string;
  status: ApplicationStatus;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
        statusStyles[status],
        className
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
