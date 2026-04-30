import Link from "next/link";
import { Rocket } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  minimal?: boolean;
};

export function SiteHeader({ minimal = false }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-sahara-border/60 bg-sahara-background/95 shadow-warm">
      <nav className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6 lg:px-10">
        <Link href="/" className="flex items-center gap-2 text-sahara-primary">
          <Rocket aria-hidden="true" className="h-6 w-6 fill-sahara-primary/10" />
          <span className="font-serif text-2xl font-bold tracking-tight">
            DevLaunch
          </span>
        </Link>
        {minimal ? (
          <Link
            href="/"
            className="text-sm font-semibold text-sahara-muted underline-offset-4 transition-colors hover:text-sahara-primary hover:underline"
          >
            Back home
          </Link>
        ) : (
          <div className="flex items-center gap-6">
            <div className="hidden items-center gap-7 md:flex">
              {[
                ["Features", "/#features"],
                ["Portfolios", "/#portfolio"],
                ["Internships", "/#internships"]
              ].map(([item, href]) => (
                <a
                  className={cn(
                    "text-sm font-semibold text-sahara-muted underline-offset-4 transition-colors hover:text-sahara-primary hover:underline",
                    item === "Features" && "text-sahara-primary"
                  )}
                  href={href}
                  key={item}
                >
                  {item}
                </a>
              ))}
            </div>
            <Link
              href="/login"
              className="hidden text-sm font-semibold text-sahara-muted underline-offset-4 transition-colors hover:text-sahara-primary hover:underline sm:inline"
            >
              Log in
            </Link>
            <Link href="/login" className={buttonVariants({ size: "sm" })}>
              Get Started
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
