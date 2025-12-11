// components/AuthGuard.tsx
"use client";

import type { ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { Skeleton } from "@/components/Skeleton";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  const { loading: profileLoading } = useUserProfile();

  const isLoading = authLoading || profileLoading;

  useEffect(() => {
    if (isLoading) return;

    // No logged-in user → go to login
    if (!user) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
      return;
    }

    // Logged in but not verified → go to verify-email
    if (user && !user.emailVerified) {
      router.replace("/verify-email");
    }
  }, [isLoading, user, router, pathname]);

  if (isLoading) {
    // While auth/profile are resolving, show a skeleton
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  // While we're redirecting, render nothing
  if (!user || !user.emailVerified) {
    return null;
  }

  return <>{children}</>;
}
