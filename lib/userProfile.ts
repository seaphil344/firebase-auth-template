// lib/userProfile.ts
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firestore";
import type { User } from "firebase/auth";

export type UserProfile = {
  email: string | null;
  createdAt: string; // ISO string
};

export async function ensureUserProfile(user: User) {
  console.log("[ensureUserProfile] called for uid:", user.uid);

  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    const profile: UserProfile = {
      email: user.email ?? null,
      createdAt: new Date().toISOString(),
    };

    console.log("[ensureUserProfile] creating doc:", profile);

    try {
      await setDoc(ref, profile);
      console.log("[ensureUserProfile] user doc created");
    } catch (err) {
      console.error("[ensureUserProfile] FAILED to create user doc:", err);
      throw err;
    }
  } else {
    console.log("[ensureUserProfile] doc already exists");
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  console.log("[getUserProfile] fetching profile for uid:", uid);

  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    console.log("[getUserProfile] no profile found");
    return null;
  }

  const data = snap.data() as UserProfile;
  console.log("[getUserProfile] got profile:", data);
  return data;
}
