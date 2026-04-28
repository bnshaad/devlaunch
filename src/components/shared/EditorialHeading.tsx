import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type EditorialHeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  as?: "h1" | "h2" | "h3";
};

export function EditorialHeading({
  as: Tag = "h1",
  className,
  ...props
}: EditorialHeadingProps) {
  return (
    <Tag
      className={cn(
        "font-serif font-bold tracking-tight text-sahara-text",
        className
      )}
      {...props}
    />
  );
}
