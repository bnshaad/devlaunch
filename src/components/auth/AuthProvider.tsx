"use client";

import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User as FirebaseUser
} from "firebase/auth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { auth, isFirebaseConfigured } from "@/lib/firebase";
import {
  createUserIfNotExists,
  getUserProfile
} from "@/services/userService";
import { type AppUser } from "@/types/user";

type AuthContextValue = {
  user: FirebaseUser | null;
  appUser: AppUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<AppUser>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<AppUser | null>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getAuthErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Authentication failed. Please try again.";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      return undefined;
    }

    let isActive = true;

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        if (!isActive) {
          return;
        }

        setUser(firebaseUser);

        if (!firebaseUser) {
          setAppUser(null);
          setLoading(false);
          return;
        }

        try {
          const profile = await createUserIfNotExists(firebaseUser);
          if (!isActive) {
            return;
          }
          setAppUser(profile);
        } catch (error) {
          if (!isActive) {
            return;
          }
          console.error("Unable to load user profile:", getAuthErrorMessage(error));
          setAppUser(null);
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      },
      (error) => {
        if (!isActive) {
          return;
        }

        console.error("Firebase auth listener failed:", getAuthErrorMessage(error));
        setUser(null);
        setAppUser(null);
        setLoading(false);
      }
    );

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!isFirebaseConfigured) {
      throw new Error(
        "Firebase is not configured yet. Add the NEXT_PUBLIC_FIREBASE_* environment variables and restart the dev server."
      );
    }

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      const profile = await createUserIfNotExists(result.user);
      setUser(result.user);
      setAppUser(profile);

      return profile;
    } catch (error) {
      console.error("Google sign-in failed:", getAuthErrorMessage(error));
      throw error;
    }
  }, []);

  const refreshUserProfile = useCallback(async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setAppUser(null);
      return null;
    }

    const profile = await getUserProfile(currentUser.uid);
    setAppUser(profile);

    return profile;
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      setUser(null);
      setAppUser(null);
    } catch (error) {
      console.error("Sign out failed:", getAuthErrorMessage(error));
      throw error;
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      appUser,
      loading,
      signInWithGoogle,
      logout,
      refreshUserProfile
    }),
    [appUser, loading, logout, refreshUserProfile, signInWithGoogle, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
