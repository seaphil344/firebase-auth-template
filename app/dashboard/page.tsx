// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { useAuth } from "@/components/AuthProvider";
import { getUserProfile, type UserProfile } from "@/lib/userProfile";

export default function DashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      try {
        const p = await getUserProfile(user.uid);
        if (!cancelled) setProfile(p);
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <AuthGuard>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p>Welcome, {user?.email}</p>

        {loadingProfile && <p className="text-sm text-gray-500">Loading profile…</p>}

        {!loadingProfile && (
          <div className="mt-4 border rounded-lg p-4 text-sm">
            <h2 className="font-semibold mb-1">User profile</h2>
            <p>Email: {profile?.email ?? "unknown"}</p>
            <p>Created: {profile?.createdAt ?? "unknown"}</p>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
