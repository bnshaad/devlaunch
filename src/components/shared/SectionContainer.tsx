import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function SectionContainer({
  className,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={cn(
        "mx-auto w-full max-w-7xl px-6 py-20 md:px-10 md:py-24",
        className
      )}
      {...props}
    />
  );
}
