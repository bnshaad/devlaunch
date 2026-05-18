"use client";

import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { AuthProvider } from "@/components/auth/AuthProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const needsAuthProvider =
    pathname === "/login" ||
    pathname === "/onboarding" ||
    pathname.startsWith("/dashboard");

  if (!needsAuthProvider) {
    return children;
  }

  return <AuthProvider>{children}</AuthProvider>;
}
