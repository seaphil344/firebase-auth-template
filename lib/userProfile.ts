// lib/userProfile.ts
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firestore";
import type { User } from "firebase/auth";

export type UserProfile = {
  email: string | null;
  createdAt: string; // ISO string
};

export async function ensureUserProfile(user: User) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    const profile: UserProfile = {
      email: user.email ?? null,
      createdAt: new Date().toISOString(),
    };

    await setDoc(ref, profile);
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}
