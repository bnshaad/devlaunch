import { type Timestamp } from "firebase/firestore";

export type AppUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  photoPath?: string | null;
  photoUpdatedAt?: Timestamp;
  username?: string | null;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};
