import { type Timestamp } from "firebase/firestore";

export type Project = {
  id: string;
  userId: string;
  title: string;
  description: string;
  techStack: string[];
  githubUrl: string;
  liveUrl: string;
  imageUrl: string;
  featured: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export type ProjectInput = {
  title: string;
  description: string;
  techStack: string[];
  githubUrl: string;
  liveUrl: string;
  imageUrl: string;
  featured: boolean;
};
