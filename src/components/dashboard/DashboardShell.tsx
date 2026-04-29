"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import {
  BriefcaseBusiness,
  FolderOpen,
  LayoutDashboard,
  Rocket,
  Settings,
  UserRound
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Profile", href: "/dashboard/profile", icon: UserRound },
  { label: "Projects", href: "/dashboard/projects", icon: FolderOpen },
  {
    label: "Applications",
    href: "/dashboard",
    icon: BriefcaseBusiness
  },
  { label: "Settings", href: "/dashboard", icon: Settings }
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-sahara-background text-sahara-text lg:flex">
      <aside className="border-b border-sahara-border/60 bg-sahara-background px-4 py-4 lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:border-b-0 lg:border-r lg:px-5">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sahara-surfaceLow text-sahara-primary">
            <Rocket aria-hidden="true" className="h-6 w-6" />
          </div>
          <div>
            <Link
              href="/"
              className="font-serif text-2xl font-bold tracking-tight text-sahara-primary"
            >
              DevLaunch
            </Link>
            <p className="text-xs font-semibold text-sahara-muted">
              Student Dashboard
            </p>
          </div>
        </div>

        <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:mt-8 lg:flex-col lg:overflow-visible">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard"
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <Link
                className={cn(
                  "flex shrink-0 items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-sahara-surfaceLow",
                  isActive
                    ? "bg-sahara-surface text-sahara-primary shadow-warm"
                    : "text-sahara-muted"
                )}
                href={item.href}
                key={item.label}
              >
                <Icon aria-hidden="true" className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 px-6 py-10 md:px-10 lg:px-14 lg:py-14">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
