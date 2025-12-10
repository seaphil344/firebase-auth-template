// lib/hooks/useUserProfile.ts
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { getUserProfile, type UserProfile } from "@/lib/userProfile";

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      const data = await getUserProfile(user.uid);
      if (!cancelled) {
        setProfile(data);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return { profile, loading };
}
