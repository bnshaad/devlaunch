"use client";

import { useEffect, useState } from "react";
import { PublicPortfolio } from "@/components/portfolio/PublicPortfolio";
import { PublicPortfolioState } from "@/components/portfolio/PublicPortfolioState";
import { getPortfolioByUserId } from "@/services/portfolioService";
import {
  getUidByUsername,
  getUserProfile,
  normalizeUsername
} from "@/services/userService";
import { type Portfolio } from "@/types/portfolio";
import { type AppUser } from "@/types/user";

type PublicPortfolioPageClientProps = {
  username: string;
};

type PublicPortfolioStatus =
  | "error"
  | "loading"
  | "not-found"
  | "private"
  | "ready";

export function PublicPortfolioPageClient({
  username
}: PublicPortfolioPageClientProps) {
  const normalizedUsername = normalizeUsername(username);
  const [status, setStatus] = useState<PublicPortfolioStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadPublicPortfolio() {
      setStatus("loading");
      setErrorMessage(null);
      setPortfolio(null);
      setUser(null);

      try {
        const uid = await getUidByUsername(normalizedUsername);

        if (!isActive) {
          return;
        }

        if (!uid) {
          setStatus("not-found");
          return;
        }

        const [profile, publicPortfolio] = await Promise.all([
          getUserProfile(uid),
          getPortfolioByUserId(uid)
        ]);

        if (!isActive) {
          return;
        }

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
        setStatus("ready");
      } catch (error) {
        if (!isActive) {
          return;
        }

        console.error("Unable to load public portfolio:", error);
        setErrorMessage("Unable to load this portfolio right now.");
        setStatus("error");
      }
    }

    loadPublicPortfolio();

    return () => {
      isActive = false;
    };
  }, [normalizedUsername]);

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
      user={user}
      username={normalizedUsername}
    />
  );
}
