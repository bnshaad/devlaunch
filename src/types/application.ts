import { type Timestamp } from "firebase/firestore";

export const APPLICATION_STATUSES = [
  "saved",
  "applied",
  "interview",
  "offer",
  "rejected"
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export type InternshipApplication = {
  id: string;
  userId: string;
  company: string;
  role: string;
  location: string;
  jobUrl: string;
  source: string;
  status: ApplicationStatus;
  appliedDate: string;
  deadline: string;
  notes: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export type InternshipApplicationInput = {
  company: string;
  role: string;
  location: string;
  jobUrl: string;
  source: string;
  status: ApplicationStatus;
  appliedDate: string;
  deadline: string;
  notes: string;
};
