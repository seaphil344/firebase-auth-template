// components/AuthGuard.tsx
"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Not logged in → go to login
    if (!user) {
      router.replace("/login");
      return;
    }

    // Logged in but not verified → go to verify-email
    if (!user.emailVerified) {
      router.replace("/verify-email");
      return;
    }
  }, [loading, user, router]);

  if (loading) {
    return <div className="p-4">Loading…</div>;
  }

  // While redirecting, don’t flash the protected content
  if (!user || !user.emailVerified) return null;

  return <>{children}</>;
}
