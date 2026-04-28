import { type ReactNode } from "react";
import { EditorialHeading } from "@/components/shared/EditorialHeading";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  className
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-6 border-b border-sahara-border/60 pb-8 md:flex-row md:items-end md:justify-between",
        className
      )}
    >
      <div>
        {eyebrow ? (
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-sahara-muted">
            {eyebrow}
          </p>
        ) : null}
        <EditorialHeading className="text-4xl leading-none md:text-5xl">
          {title}
        </EditorialHeading>
        {description ? (
          <p className="mt-4 max-w-2xl leading-7 text-sahara-muted">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
