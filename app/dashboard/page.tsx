// app/dashboard/page.tsx
"use client";

import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { Skeleton } from "@/components/Skeleton";

export default function DashboardPage() {
  const { profile, loading } = useUserProfile();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Overview of your account and recent activity.
        </p>
      </div>

      {loading && (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-1/2" />
        </div>
      )}

      {!loading && profile && (
        <div className="border border-slate-200 bg-white rounded-lg p-4 text-sm space-y-1 dark:border-slate-800 dark:bg-slate-950/60">
          <div>
            <strong>Email:</strong> {profile.email}
          </div>
          <div>
            <strong>Role:</strong> {profile.role}
          </div>
          <div>
            <strong>Auth provider:</strong> {profile.authProvider}
          </div>
          <div>
            <strong>Email verified:</strong>{" "}
            {profile.emailVerified ? "Yes" : "No"}
          </div>
          <div>
            <strong>Onboarding completed:</strong>{" "}
            {profile.onboardingCompleted ? "Yes" : "No"}
          </div>
          <div>
            <strong>Created:</strong> {profile.createdAt}
          </div>
          <div>
            <strong>Last login:</strong> {profile.lastLoginAt}
          </div>
        </div>
      )}
    </div>
  );
}
