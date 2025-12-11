"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { getUserProfile, type UserProfile } from "@/lib/userProfile";

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function syncProfile() {
      // No user → clear profile & stop loading
      if (!user) {
        if (cancelled) return;
        setProfile(null);
        setLoading(false);
        return;
      }

      // Have a user → load profile
      setLoading(true);
      const data = await getUserProfile(user.uid);

      if (!cancelled) {
        setProfile(data);
        setLoading(false);
      }
    }

    void syncProfile();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return { profile, loading };
}
