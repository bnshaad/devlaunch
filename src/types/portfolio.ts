import { type Timestamp } from "firebase/firestore";

export type Portfolio = {
  userId: string;
  fullName: string;
  headline: string;
  bio: string;
  location: string;
  email: string;
  githubUrl: string;
  linkedinUrl: string;
  websiteUrl: string;
  skills: string[];
  isPublic: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export type PortfolioInput = {
  fullName: string;
  headline: string;
  bio: string;
  location: string;
  email: string;
  githubUrl: string;
  linkedinUrl: string;
  websiteUrl: string;
  skills: string[];
  isPublic: boolean;
};
