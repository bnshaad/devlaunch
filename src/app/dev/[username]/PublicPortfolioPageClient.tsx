"use client";

import { useEffect, useState } from "react";
import { PublicPortfolio } from "@/components/portfolio/PublicPortfolio";
import { PublicPortfolioState } from "@/components/portfolio/PublicPortfolioState";
import { getPortfolioByUserId } from "@/services/portfolioService";
import { getPublicProjectsByUser } from "@/services/projectService";
import {
  getUidByUsername,
  getUserProfile,
  normalizeUsername
} from "@/services/userService";
import { type Portfolio } from "@/types/portfolio";
import { type Project } from "@/types/project";
import { type AppUser } from "@/types/user";

export type PublicPortfolioStatus =
  | "error"
  | "loading"
  | "not-found"
  | "private"
  | "ready";

export type PublicPortfolioInitialData = {
  status: PublicPortfolioStatus;
  portfolio?: Portfolio | null;
  projects?: Project[];
  user?: AppUser | null;
} | null;

type PublicPortfolioPageClientProps = {
  username: string;
  initialData?: PublicPortfolioInitialData;
};

// In-memory client cache to eliminate redundant fetches on repeated visits
const portfolioCache = new Map<
  string,
  {
    portfolio: Portfolio;
    projects: Project[];
    user: AppUser;
    cachedAt: number;
  }
>();

const CACHE_TTL_MS = 60 * 1000; // 1 minute in-memory cache

export function PublicPortfolioPageClient({
  username,
  initialData
}: PublicPortfolioPageClientProps) {
  const normalizedUsername = normalizeUsername(username);

  // Check if we have instant data (from SSR initialData or in-memory cache)
  const cached = portfolioCache.get(normalizedUsername);
  const isCacheValid = cached && Date.now() - cached.cachedAt < CACHE_TTL_MS;

  const [status, setStatus] = useState<PublicPortfolioStatus>(() => {
    if (initialData?.status) return initialData.status;
    if (isCacheValid) return "ready";
    return "loading";
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(() => {
    if (initialData?.portfolio) return initialData.portfolio;
    if (isCacheValid) return cached.portfolio;
    return null;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    if (initialData?.projects) return initialData.projects;
    if (isCacheValid) return cached.projects;
    return [];
  });

  const [user, setUser] = useState<AppUser | null>(() => {
    if (initialData?.user) return initialData.user;
    if (isCacheValid) return cached.user;
    return null;
  });

  useEffect(() => {
    // If SSR already provided ready, not-found, or private data, we don't need to re-fetch immediately
    if (initialData && initialData.status !== "loading") {
      if (initialData.status === "ready" && initialData.portfolio && initialData.user) {
        portfolioCache.set(normalizedUsername, {
          portfolio: initialData.portfolio,
          projects: initialData.projects || [],
          user: initialData.user,
          cachedAt: Date.now()
        });
      }
      return;
    }

    // Check valid client cache
    const existingCache = portfolioCache.get(normalizedUsername);
    if (existingCache && Date.now() - existingCache.cachedAt < CACHE_TTL_MS) {
      setPortfolio(existingCache.portfolio);
      setProjects(existingCache.projects);
      setUser(existingCache.user);
      setStatus("ready");
      return;
    }

    let isActive = true;

    async function loadPublicPortfolio() {
      setStatus("loading");
      setErrorMessage(null);

      try {
        const uid = await getUidByUsername(normalizedUsername);

        if (!isActive) return;

        if (!uid) {
          setStatus("not-found");
          return;
        }

        // Parallelize userProfile, portfolio, and projects simultaneously (no waterfall!)
        const [profile, publicPortfolio, publicProjects] = await Promise.all([
          getUserProfile(uid),
          getPortfolioByUserId(uid),
          getPublicProjectsByUser(uid)
        ]);

        if (!isActive) return;

        if (!profile || !publicPortfolio) {
          setStatus("not-found");
          return;
        }

        if (!publicPortfolio.isPublic) {
          setStatus("private");
          return;
        }

        setUser(profile);
        setPortfolio(publicPortfolio);
        setProjects(publicProjects);
        setStatus("ready");

        // Cache for fast subsequent navigation
        portfolioCache.set(normalizedUsername, {
          portfolio: publicPortfolio,
          projects: publicProjects,
          user: profile,
          cachedAt: Date.now()
        });
      } catch (error) {
        if (!isActive) return;

        console.error("Unable to load public portfolio:", error);
        setErrorMessage("Unable to load this portfolio right now.");
        setStatus("error");
      }
    }

    loadPublicPortfolio();

    return () => {
      isActive = false;
    };
  }, [initialData, normalizedUsername]);

  if (status === "loading") {
    return (
      <PublicPortfolioState
        username={normalizedUsername}
        variant="loading"
      />
    );
  }

  if (status === "not-found") {
    return (
      <PublicPortfolioState
        username={normalizedUsername}
        variant="not-found"
      />
    );
  }

  if (status === "private") {
    return (
      <PublicPortfolioState
        username={normalizedUsername}
        variant="private"
      />
    );
  }

  if (status === "error" || !portfolio || !user) {
    return (
      <PublicPortfolioState
        message={errorMessage ?? undefined}
        username={normalizedUsername}
        variant="error"
      />
    );
  }

  return (
    <PublicPortfolio
      portfolio={portfolio}
      projects={projects}
      user={user}
      username={normalizedUsername}
    />
  );
}
