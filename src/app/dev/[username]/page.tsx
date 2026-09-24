import { PublicPortfolioPageClient } from "@/app/dev/[username]/PublicPortfolioPageClient";
import { getFirebaseAdminDb } from "@/lib/firebaseAdmin";
import { normalizeUsername } from "@/services/userService";
import { type Portfolio } from "@/types/portfolio";
import { type Project } from "@/types/project";
import { type AppUser } from "@/types/user";

// Enable Next.js ISR (Incremental Static Regeneration) cache
export const revalidate = 60;

type PublicPortfolioPageProps = {
  params: Promise<{
    username: string;
  }>;
};

async function getPublicPortfolioServerData(username: string) {
  try {
    const normalizedUsername = normalizeUsername(username);
    if (!normalizedUsername) return null;

    const db = getFirebaseAdminDb();
    const usernameDoc = await db.doc(`usernames/${normalizedUsername}`).get();

    if (!usernameDoc.exists) {
      return { status: "not-found" as const };
    }

    const uid = usernameDoc.data()?.uid;
    if (!uid || typeof uid !== "string") {
      return { status: "not-found" as const };
    }

    const [userDoc, portfolioDoc, projectsSnap] = await Promise.all([
      db.doc(`users/${uid}`).get(),
      db.doc(`portfolios/${uid}`).get(),
      db.collection("projects").where("userId", "==", uid).get()
    ]);

    if (!userDoc.exists || !portfolioDoc.exists) {
      return { status: "not-found" as const };
    }

    const portfolioData = portfolioDoc.data();
    if (!portfolioData?.isPublic) {
      return { status: "private" as const };
    }

    const userData = userDoc.data();
    const user: AppUser = {
      uid,
      email: userData?.email ?? null,
      displayName: userData?.displayName ?? null,
      photoURL: typeof userData?.photoURL === "string" ? userData.photoURL : "",
      photoPublicId:
        typeof userData?.photoPublicId === "string" ? userData.photoPublicId : "",
      photoUpdatedAt: null,
      username: userData?.username ?? normalizedUsername
    };

    const portfolio: Portfolio = {
      userId: uid,
      fullName: portfolioData.fullName ?? "",
      headline: portfolioData.headline ?? "",
      bio: portfolioData.bio ?? "",
      location: portfolioData.location ?? "",
      email: portfolioData.email ?? "",
      githubUrl: portfolioData.githubUrl ?? "",
      linkedinUrl: portfolioData.linkedinUrl ?? "",
      websiteUrl: portfolioData.websiteUrl ?? "",
      skills: Array.isArray(portfolioData.skills) ? portfolioData.skills : [],
      isPublic: true
    };

    const projects: Project[] = projectsSnap.docs
      .map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          userId: d.userId ?? "",
          title: d.title ?? "",
          description: d.description ?? "",
          techStack: Array.isArray(d.techStack) ? d.techStack : [],
          githubUrl: d.githubUrl ?? "",
          liveUrl: d.liveUrl ?? "",
          imageUrl: d.imageUrl ?? "",
          featured: Boolean(d.featured),
          sortTime:
            d.updatedAt?.toMillis?.() ?? d.createdAt?.toMillis?.() ?? 0
        };
      })
      .sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        return (b.sortTime || 0) - (a.sortTime || 0);
      })
      .map(({ sortTime: _st, ...p }) => p);

    return {
      status: "ready" as const,
      user,
      portfolio,
      projects
    };
  } catch (err) {
    // Graceful fallback to client-side hydration if server query fails
    console.warn("[PORTFOLIO SSR] Fallback to client fetch:", err);
    return null;
  }
}

export default async function PublicPortfolioPage({
  params
}: PublicPortfolioPageProps) {
  const { username } = await params;
  const initialData = await getPublicPortfolioServerData(username);

  return (
    <PublicPortfolioPageClient
      initialData={initialData}
      username={username}
    />
  );
}
