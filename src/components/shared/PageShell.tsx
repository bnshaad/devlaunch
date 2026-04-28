import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageShellProps = {
  children: ReactNode;
  className?: string;
};

export function PageShell({ children, className }: PageShellProps) {
  return (
    <main className={cn("min-h-screen bg-sahara-background text-sahara-text", className)}>
      {children}
    </main>
  );
}
