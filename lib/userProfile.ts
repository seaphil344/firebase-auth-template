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

  createdAt: string;    // ISO string
  lastLoginAt: string;  // ISO string
};

function getAuthProvider(user: User): AuthProvider {
  const providers = user.providerData.map((p) => p.providerId);
  if (providers.includes("google.com")) return "google";
  return "password";
}

function toISO(val: any, fallback: string): string {
  if (!val) return fallback;
  if (typeof val === "string") return val;

  // Firestore Timestamp has .toDate()
  if (val && typeof val.toDate === "function") {
    return val.toDate().toISOString();
  }

  // Fallback if it's a plain seconds/nanoseconds object
  if (typeof val.seconds === "number") {
    return new Date(val.seconds * 1000).toISOString();
  }

  return fallback;
}

export async function ensureUserProfile(user: User) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  const authProvider = getAuthProvider(user);
  const createdISO =
    user.metadata.creationTime ?? new Date().toISOString();
  const lastLoginISO =
    user.metadata.lastSignInTime ?? new Date().toISOString();

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

    createdAt: toISO(existing.createdAt, createdISO),
    lastLoginAt: lastLoginISO, // always updated on login/signup
  };

  await setDoc(ref, updated, { merge: true });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  const raw = snap.data() as any;

  // Normalize on read as well
  const profile: UserProfile = {
    email: raw.email ?? null,
    displayName: raw.displayName ?? null,
    photoURL: raw.photoURL ?? null,

    role: (raw.role as UserRole) ?? "user",

    emailVerified: !!raw.emailVerified,
    authProvider: (raw.authProvider as AuthProvider) ?? "password",

    onboardingCompleted: !!raw.onboardingCompleted,

    createdAt: toISO(raw.createdAt, new Date().toISOString()),
    lastLoginAt: toISO(raw.lastLoginAt, new Date().toISOString()),
  };

  return profile;
}
