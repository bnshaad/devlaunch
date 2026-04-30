import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
  type DocumentData,
  type Timestamp
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { type Portfolio, type PortfolioInput } from "@/types/portfolio";

function toPortfolio(data: DocumentData): Portfolio {
  return {
    userId: data.userId,
    fullName: data.fullName ?? "",
    headline: data.headline ?? "",
    bio: data.bio ?? "",
    location: data.location ?? "",
    email: data.email ?? "",
    githubUrl: data.githubUrl ?? "",
    linkedinUrl: data.linkedinUrl ?? "",
    websiteUrl: data.websiteUrl ?? "",
    skills: Array.isArray(data.skills) ? data.skills : [],
    isPublic: Boolean(data.isPublic),
    createdAt: data.createdAt as Timestamp | undefined,
    updatedAt: data.updatedAt as Timestamp | undefined
  };
}

function normalizePortfolioInput(data: PortfolioInput): PortfolioInput {
  return {
    fullName: data.fullName?.trim() ?? "",
    headline: data.headline.trim(),
    bio: data.bio?.trim() ?? "",
    location: data.location?.trim() ?? "",
    email: data.email?.trim() ?? "",
    githubUrl: data.githubUrl?.trim() ?? "",
    linkedinUrl: data.linkedinUrl?.trim() ?? "",
    websiteUrl: data.websiteUrl?.trim() ?? "",
    skills: Array.isArray(data.skills)
      ? data.skills
          .map((skill) => skill.trim())
          .filter(
            (skill, index, skills) =>
              skill &&
              skills.findIndex(
                (candidate) => candidate.toLowerCase() === skill.toLowerCase()
              ) === index
          )
          .slice(0, 20)
      : [],
    isPublic: Boolean(data.isPublic)
  };
}

function assertCurrentUserOwnsPortfolio(userId: string) {
  const currentUserId = auth.currentUser?.uid;

  if (!currentUserId) {
    throw new Error("You must be signed in to save a portfolio.");
  }

  if (currentUserId !== userId) {
    throw new Error("You can only save your own portfolio.");
  }
}

export async function getPortfolio(userId: string) {
  const portfolioSnapshot = await getDoc(doc(db, "portfolios", userId));

  if (!portfolioSnapshot.exists()) {
    return null;
  }

  return toPortfolio(portfolioSnapshot.data());
}

export async function createOrUpdatePortfolio(
  userId: string,
  data: PortfolioInput
) {
  assertCurrentUserOwnsPortfolio(userId);

  const portfolioRef = doc(db, "portfolios", userId);
  const portfolioSnapshot = await getDoc(portfolioRef);
  const normalizedData = normalizePortfolioInput(data);

  if (!portfolioSnapshot.exists()) {
    const newPortfolio = {
      ...normalizedData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(portfolioRef, newPortfolio);
    return getPortfolio(userId);
  }

  const existingPortfolio = toPortfolio(portfolioSnapshot.data());

  if (existingPortfolio.userId !== userId) {
    throw new Error("This portfolio does not belong to the signed-in user.");
  }

  await updateDoc(portfolioRef, {
    ...normalizedData,
    updatedAt: serverTimestamp()
  });

  return getPortfolio(userId);
}

export async function getPortfolioByUserId(userId: string) {
  return getPortfolio(userId);
}
