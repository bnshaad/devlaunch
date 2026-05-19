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
import {
  auth,
  firebasePublicConfigStatus,
  isFirebaseConfigured
} from "@/lib/firebase";
import { createUserIfNotExists } from "@/services/userService";
import { type AppUser } from "@/types/user";

type AuthContextValue = {
  firebaseUser: FirebaseUser | null;
  user: FirebaseUser | null;
  appUser: AppUser | null;
  loading: boolean;
  authLoading: boolean;
  profileLoading: boolean;
  profileError: string | null;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<AppUser | null>;
  clearAuthError: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const PROFILE_LOAD_TIMEOUT_MS = 15000;

type ProfileLoadOptions = {
  preserveExistingProfileOnError?: boolean;
};

function getAuthErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error && "message" in error) {
    const message = (error as { message?: unknown }).message;

    if (typeof message === "string" && message) {
      return message;
    }
  }

  return "Authentication failed. Please try again.";
}

function getAuthErrorCode(error: unknown) {
  if (typeof error === "object" && error && "code" in error) {
    return String((error as { code?: unknown }).code);
  }

  return null;
}

function getErrorName(error: unknown) {
  if (error instanceof Error) {
    return error.name;
  }

  if (typeof error === "object" && error && "name" in error) {
    const name = (error as { name?: unknown }).name;

    return typeof name === "string" ? name : null;
  }

  return null;
}

function getReadableErrorDetails(error: unknown) {
  return {
    code: getAuthErrorCode(error),
    message: getAuthErrorMessage(error),
    name: getErrorName(error)
  };
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
  const [profileError, setProfileError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(
    isFirebaseConfigured
      ? null
      : "Firebase is not configured yet. Add the NEXT_PUBLIC_FIREBASE_* environment variables and restart the dev server."
  );
  const loading = authLoading || profileLoading;

  const loadUserProfile = useCallback(async (
    firebaseUser: FirebaseUser,
    options: ProfileLoadOptions = {}
  ) => {
    setProfileLoading(true);
    setProfileError(null);

    try {
      const profile = await withTimeout(
        createUserIfNotExists(firebaseUser),
        PROFILE_LOAD_TIMEOUT_MS,
        "DevLaunch could not load your profile in time. Please try again."
      );

      setAppUser(profile);
      setAuthError(null);
      logAuthDebug("appUser loaded", {
        hasUid: Boolean(profile.uid),
        hasUsername: Boolean(profile.username),
        username: profile.username ?? null
      });
      logAuthDebug("appUser.username value", profile.username ?? null);

      return profile;
    } catch (error) {
      const details = getReadableErrorDetails(error);

      console.warn("[AUTH DEBUG] Unable to load user profile:", details);

      if (!options.preserveExistingProfileOnError) {
        setAppUser(null);
        setProfileError(
          "You are signed in, but DevLaunch could not load your profile from Firestore. Check your connection or Firestore rules, then try again."
        );
      }

      return null;
    } finally {
      setProfileLoading(false);
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    logAuthDebug("Firebase public config status", firebasePublicConfigStatus);

    if (!isFirebaseConfigured) {
      logAuthDebug("Firebase auth listener skipped; config missing");
      return undefined;
    }

    let isActive = true;

    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        logAuthDebug("Firebase auth persistence ready", {
          persistence: "browserLocalPersistence"
        });
      })
      .catch((error) => {
        console.error(
          "[AUTH DEBUG] Firebase auth persistence failed:",
          getAuthErrorMessage(error)
        );
      });

    getRedirectResult(auth)
      .then((result) => {
        logAuthDebug("getRedirectResult result", {
          hasUser: Boolean(result?.user),
          hasUid: Boolean(result?.user?.uid),
          hasEmail: Boolean(result?.user?.email)
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
          hasUid: Boolean(firebaseUser?.uid),
          hasEmail: Boolean(firebaseUser?.email)
        });

        if (!isActive) {
          return;
        }

        if (!firebaseUser) {
          setUser(null);
          setAppUser(null);
          setProfileError(null);
          setProfileLoading(false);
          setAuthLoading(false);
          logAuthDebug("Firebase user is null; auth state cleared");
          return;
        }

        setUser(firebaseUser);
        setAppUser(null);
        setAuthLoading(false);
        await loadUserProfile(firebaseUser);
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
  }, [loadUserProfile]);

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
      setProfileError(null);
      await setPersistence(auth, browserLocalPersistence);
      logAuthDebug("signInWithPopup called");
      const result = await signInWithPopup(auth, provider);
      logAuthDebug("signInWithPopup completed", {
        hasUid: Boolean(result.user.uid),
        hasEmail: Boolean(result.user.email)
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
      console.error("[AUTH DEBUG] Google sign-in failed:", {
        code,
        message
      });
      setAuthError(message);
      throw error;
    }
  }, []);

  const refreshUserProfile = useCallback(async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setAppUser(null);
      setProfileError(null);
      return null;
    }

    return loadUserProfile(currentUser, {
      preserveExistingProfileOnError: true
    });
  }, [loadUserProfile]);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      setUser(null);
      setAppUser(null);
      setProfileError(null);
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
      profileError,
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
      profileError,
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
