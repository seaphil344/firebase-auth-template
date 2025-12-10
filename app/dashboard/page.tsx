// app/dashboard/page.tsx
"use client";

import { AuthGuard } from "@/components/AuthGuard";
import { useUserProfile } from "@/lib/hooks/useUserProfile";

export default function DashboardPage() {
  const { profile, loading } = useUserProfile();

  const createdAtString =
    profile?.createdAt && "toDate" in profile.createdAt
      ? profile.createdAt.toDate().toLocaleString()
      : "—";

  return (
    <AuthGuard>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>

        {loading && <p className="text-sm text-gray-500">Loading profile…</p>}

        {profile && (
          <div className="border rounded-lg p-4 text-sm space-y-1">
            <div>
              <strong>Email:</strong> {profile.email}
            </div>
            <div>
              <strong>Role:</strong> {profile.role}
            </div>
            <div>
              <strong>Name:</strong> {profile.displayName ?? "—"}
            </div>
            <div>
              <strong>Email verified:</strong>{" "}
              {profile.emailVerified ? "Yes" : "No"}
            </div>
            <div>
              <strong>Created:</strong> {createdAtString}
            </div>
          </div>
        )}

        {profile?.role === "admin" && (
          <div className="border rounded-lg p-4 bg-yellow-50 text-sm">
            👑 Admin-only content goes here
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
