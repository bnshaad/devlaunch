"use client";

import {
  browserLocalPersistence,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signInWithRedirect,
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
  firebaseUser: FirebaseUser | null;
  user: FirebaseUser | null;
  appUser: AppUser | null;
  loading: boolean;
  authLoading: boolean;
  profileLoading: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<AppUser | null>;
  clearAuthError: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const PROFILE_LOAD_TIMEOUT_MS = 15000;

function getAuthErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Authentication failed. Please try again.";
}

function getAuthErrorCode(error: unknown) {
  if (typeof error === "object" && error && "code" in error) {
    return String((error as { code?: unknown }).code);
  }

  return null;
}

function logAuthDebug(message: string, details?: unknown) {
  if (process.env.NODE_ENV !== "production") {
    console.info(`[AUTH DEBUG] ${message}`, details ?? "");
  }
}

function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string
) {
  return new Promise<T>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, timeoutMs);

    promise
      .then((value) => {
        window.clearTimeout(timeout);
        resolve(value);
      })
      .catch((error: unknown) => {
        window.clearTimeout(timeout);
        reject(error);
      });
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [authLoading, setAuthLoading] = useState(isFirebaseConfigured);
  const [profileLoading, setProfileLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const loading = authLoading || profileLoading;

  useEffect(() => {
    if (!isFirebaseConfigured) {
      logAuthDebug("Firebase auth listener skipped; config missing");
      return undefined;
    }

    let isActive = true;

    getRedirectResult(auth)
      .then((result) => {
        logAuthDebug("getRedirectResult result", {
          hasUser: Boolean(result?.user),
          uid: result?.user.uid ?? null
        });
      })
      .catch((error) => {
        const message = getAuthErrorMessage(error);
        console.error("[AUTH DEBUG] getRedirectResult error", message);

        if (isActive) {
          setAuthError(
            "Google sign-in could not be completed. Please try again."
          );
        }
      });

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        logAuthDebug("onAuthStateChanged fired", {
          hasFirebaseUser: Boolean(firebaseUser),
          uid: firebaseUser?.uid ?? null
        });

        if (!isActive) {
          return;
        }

        if (!firebaseUser) {
          setUser(null);
          setAppUser(null);
          setProfileLoading(false);
          setAuthLoading(false);
          logAuthDebug("Firebase user is null; auth state cleared");
          return;
        }

        setUser(firebaseUser);
        setAppUser(null);
        setProfileLoading(true);
        setAuthLoading(false);

        try {
          const profile = await withTimeout(
            createUserIfNotExists(firebaseUser),
            PROFILE_LOAD_TIMEOUT_MS,
            "DevLaunch could not load your profile in time. Please try again."
          );
          if (!isActive) {
            return;
          }
          setAppUser(profile);
          setAuthError(null);
          logAuthDebug("appUser loaded", {
            uid: profile.uid,
            username: profile.username ?? null
          });
          logAuthDebug("appUser.username value", profile.username ?? null);
        } catch (error) {
          if (!isActive) {
            return;
          }
          console.error(
            "[AUTH DEBUG] Unable to load user profile:",
            getAuthErrorMessage(error)
          );
          setAppUser(null);
          setUser(null);
          setAuthError(
            "Google sign-in succeeded, but DevLaunch could not load your profile. Please try again."
          );
          await signOut(auth).catch((signOutError) => {
            console.error(
              "Sign out after profile load failure failed:",
              getAuthErrorMessage(signOutError)
            );
          });
        } finally {
          if (isActive) {
            setProfileLoading(false);
            setAuthLoading(false);
          }
        }
      },
      (error) => {
        if (!isActive) {
          return;
        }

        console.error(
          "[AUTH DEBUG] Firebase auth listener failed:",
          getAuthErrorMessage(error)
        );
        setUser(null);
        setAppUser(null);
        setAuthError("Authentication failed. Please refresh and try again.");
        setAuthLoading(false);
        setProfileLoading(false);
      }
    );

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    logAuthDebug("signInWithGoogle called");

    if (!isFirebaseConfigured) {
      throw new Error(
        "Firebase is not configured yet. Add the NEXT_PUBLIC_FIREBASE_* environment variables and restart the dev server."
      );
    }

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      setAuthError(null);
      await setPersistence(auth, browserLocalPersistence);
      logAuthDebug("signInWithPopup called");
      const result = await signInWithPopup(auth, provider);
      logAuthDebug("signInWithPopup completed", {
        uid: result.user.uid
      });
    } catch (error) {
      const code = getAuthErrorCode(error);

      if (code === "auth/popup-blocked") {
        logAuthDebug("signInWithPopup blocked; falling back to redirect", {
          code
        });
        logAuthDebug("signInWithRedirect called");
        await signInWithRedirect(auth, provider);
        return;
      }

      const message = getAuthErrorMessage(error);
      console.error("[AUTH DEBUG] Google sign-in failed:", message);
      setAuthError(message);
      throw error;
    }
  }, []);

  const refreshUserProfile = useCallback(async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setAppUser(null);
      return null;
    }

    setProfileLoading(true);

    try {
      const profile = await getUserProfile(currentUser.uid);
      setAppUser(profile);

      return profile;
    } finally {
      setProfileLoading(false);
    }
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

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const value = useMemo(
    () => ({
      firebaseUser: user,
      user,
      appUser,
      loading,
      authLoading,
      profileLoading,
      authError,
      signInWithGoogle,
      logout,
      refreshUserProfile,
      clearAuthError
    }),
    [
      appUser,
      authLoading,
      authError,
      clearAuthError,
      loading,
      logout,
      refreshUserProfile,
      signInWithGoogle,
      profileLoading,
      user
    ]
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
