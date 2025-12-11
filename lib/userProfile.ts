// lib/userProfile.ts
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firestore";
import type { User } from "firebase/auth";

export type UserRole = "user" | "admin";
export type AuthProvider = "password" | "google";

export type UserProfile = {
  email: string | null;
  displayName: string | null;
  photoURL: string | null;

  role: UserRole;

  emailVerified: boolean;
  authProvider: AuthProvider;

  onboardingCompleted: boolean;

  createdAt: string;   // ISO string
  lastLoginAt: string; // ISO string
};

function getAuthProvider(user: User): AuthProvider {
  const providers = user.providerData.map((p) => p.providerId);
  if (providers.includes("google.com")) return "google";
  return "password";
}

function normalizeDate(val: unknown, fallback: string): string {
  if (!val) return fallback;
  if (typeof val === "string") return val;

  // Firestore Timestamp-like
  if (typeof val === "object" && val !== null) {
    const maybeTs = val as { toDate?: () => Date; seconds?: number };
    if (typeof maybeTs.toDate === "function") {
      return maybeTs.toDate().toISOString();
    }
    if (typeof maybeTs.seconds === "number") {
      return new Date(maybeTs.seconds * 1000).toISOString();
    }
  }

  return fallback;
}

export async function ensureUserProfile(user: User) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  const createdISO = user.metadata.creationTime ?? new Date().toISOString();
  const lastLoginISO = user.metadata.lastSignInTime ?? new Date().toISOString();
  const authProvider = getAuthProvider(user);

  if (!snap.exists()) {
    const profile: UserProfile = {
      email: user.email ?? null,
      displayName: user.displayName ?? null,
      photoURL: user.photoURL ?? null,
      role: "user",
      emailVerified: user.emailVerified,
      authProvider,
      onboardingCompleted: false,
      createdAt: createdISO,
      lastLoginAt: lastLoginISO,
    };

    await setDoc(ref, profile);
    return;
  }

  const existing = snap.data() as Partial<UserProfile>;

  const updated: UserProfile = {
    email: existing.email ?? user.email ?? null,
    displayName: existing.displayName ?? user.displayName ?? null,
    photoURL: existing.photoURL ?? user.photoURL ?? null,

    role: (existing.role as UserRole) ?? "user",

    emailVerified: user.emailVerified,
    authProvider: (existing.authProvider as AuthProvider) ?? authProvider,

    onboardingCompleted: existing.onboardingCompleted ?? false,

    createdAt: normalizeDate(existing.createdAt, createdISO),
    lastLoginAt: lastLoginISO,
  };

  await setDoc(ref, updated, { merge: true });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  const raw = snap.data() as Partial<UserProfile>;

  const fallback = new Date().toISOString();

  return {
    email: raw.email ?? null,
    displayName: raw.displayName ?? null,
    photoURL: raw.photoURL ?? null,
    role: (raw.role as UserRole) ?? "user",
    emailVerified: !!raw.emailVerified,
    authProvider: (raw.authProvider as AuthProvider) ?? "password",
    onboardingCompleted: !!raw.onboardingCompleted,
    createdAt: normalizeDate(raw.createdAt, fallback),
    lastLoginAt: normalizeDate(raw.lastLoginAt, fallback),
  };
}
