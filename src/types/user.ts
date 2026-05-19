import { type Timestamp } from "firebase/firestore";

export type AppUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string;
  photoPublicId: string;
  photoUpdatedAt: Timestamp | null;
  username?: string | null;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};
