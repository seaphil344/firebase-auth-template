// lib/userProfile.ts
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "./firestore";
import type { User } from "firebase/auth";

export type UserRole = "user" | "admin";

export type UserProfile = {
  email: string | null;
  role: UserRole;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  createdAt: Timestamp | null;
};

export async function ensureUserProfile(user: User) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  const baseProfile: UserProfile = {
    email: user.email ?? null,
    role: "user",
    displayName: user.displayName ?? null,
    photoURL: user.photoURL ?? null,
    emailVerified: user.emailVerified,
    createdAt: null, // will be set by serverTimestamp on write
  };

  if (!snap.exists()) {
    await setDoc(ref, {
      ...baseProfile,
      createdAt: serverTimestamp(),
    });
    return;
  }

  const existing = snap.data() as Partial<UserProfile>;

  await setDoc(
    ref,
    {
      email: existing.email ?? baseProfile.email,
      role: existing.role ?? "user",
      displayName: existing.displayName ?? baseProfile.displayName,
      photoURL: existing.photoURL ?? baseProfile.photoURL,
      emailVerified: user.emailVerified,
      // don't overwrite createdAt on existing users
    },
    { merge: true }
  );
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}
