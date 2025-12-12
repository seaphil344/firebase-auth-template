"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { auth } from "@/lib/firebaseClient";
import { useAuth } from "./AuthProvider";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { Skeleton } from "@/components/Skeleton";

export default function Navbar() {
  const router = useRouter();

  // Auth state
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const isLoading = authLoading || profileLoading;

  // Theme
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme =
    theme === "system" ? systemTheme ?? "light" : theme;

  async function handleSignOut() {
    await signOut(auth);

    await fetch("/api/session", {
      method: "DELETE",
      credentials: "include",
    });

    router.replace("/login");
  }

  const displayName =
    profile?.displayName ??
    user?.displayName ??
    user?.email ??
    "User";

  const avatarURL = profile?.photoURL ?? user?.photoURL ?? null;

  return (
    <header className="w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/95 backdrop-blur">
      <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[11px] font-bold text-slate-900 dark:text-slate-100">
            NX
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              MyApp Starter
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Next.js + Firebase
            </span>
          </div>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
          
          {/* 🌗 Theme Toggle (only show after mount) */}
          {mounted && (
            <button
              type="button"
              onClick={() =>
                setTheme(currentTheme === "dark" ? "light" : "dark")
              }
              className="inline-flex items-center justify-center rounded-full border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/60 px-2.5 py-1 text-[11px] sm:text-xs text-slate-700 dark:text-slate-200 hover:border-sky-500 hover:text-sky-600 dark:hover:text-sky-300 transition-colors"
              aria-label="Toggle light/dark mode"
            >
              {currentTheme === "dark" ? "☀️ Light" : "🌙 Dark"}
            </button>
          )}

          {/* Loading State (Auth or Profile loading) */}
          {isLoading && (
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="hidden sm:flex flex-col gap-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-2 w-16" />
              </div>
            </div>
          )}

          {/* Not Logged In */}
          {!isLoading && !user && (
            <>
              <Link
                href="/login"
                className="hover:text-sky-500 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-full border border-slate-300 dark:border-slate-700 px-3 py-1 text-[11px] sm:text-xs hover:border-sky-500 hover:text-sky-500 transition-colors"
              >
                Get started
              </Link>
            </>
          )}

          {/* Logged In */}
          {!isLoading && user && (
            <>
              <Link
                href="/dashboard"
                className="hover:text-sky-500 transition-colors"
              >
                Dashboard
              </Link>

              <Link
                href="/settings"
                className="hidden sm:inline-block hover:text-sky-500 transition-colors"
              >
                Settings
              </Link>

              <div className="h-4 w-px bg-slate-300 dark:bg-slate-800 hidden sm:block" />

              <div className="flex items-center gap-3">
                {/* Avatar */}
                {avatarURL ? (
                  <img
                    src={avatarURL}
                    alt={displayName}
                    className="w-8 h-8 rounded-full object-cover border border-slate-300 dark:border-slate-700"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-[11px] font-medium">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Name + role */}
                <div className="hidden sm:flex flex-col leading-tight">
                  <span className="text-xs font-medium text-slate-900 dark:text-slate-100">
                    {displayName}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {profile?.role === "admin" ? "Admin" : "Member"}
                  </span>
                </div>

                {/* Logout */}
                <button
                  onClick={handleSignOut}
                  className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-300 underline underline-offset-2 transition-colors"
                >
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
