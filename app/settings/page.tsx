"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { updateProfile } from "firebase/auth";
import { toast } from "sonner";
import { auth } from "@/lib/firebaseClient";
import { AuthGuard } from "@/components/AuthGuard";
import { useAuth } from "@/components/AuthProvider";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { updateUserProfile } from "@/lib/userProfile";
import { Skeleton } from "@/components/Skeleton";

export default function SettingsPage() {
  const { user } = useAuth();
  const { profile, loading } = useUserProfile();

  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  // Prevent overwriting user input after first load
  const didInit = useRef(false);

  useEffect(() => {
    let cancelled = false;

    function initFormOnce() {
      if (didInit.current) return;
      if (!profile || cancelled) return;

      setDisplayName(profile.displayName ?? "");
      setPhotoURL(profile.photoURL ?? "");
      setOnboardingCompleted(profile.onboardingCompleted ?? false);

      didInit.current = true;
    }

    initFormOnce();

    return () => {
      cancelled = true;
    };
  }, [profile]);

  if (!user) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    toast.promise(
      (async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error("Not authenticated");

        // Update Firebase Auth profile
        await updateProfile(currentUser, {
          displayName: displayName || null,
          photoURL: photoURL || null,
        });

        // Update Firestore profile
        await updateUserProfile(currentUser.uid, {
          displayName: displayName || null,
          photoURL: photoURL || null,
          onboardingCompleted,
        });
      })(),
      {
        loading: "Saving your settings...",
        success: "Settings saved successfully!",
        error: "Failed to save settings.",
      }
    );
  }

  return (
    <AuthGuard>
      <div className="max-w-3xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold">Account settings</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Manage your profile and account preferences.
          </p>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid gap-6 md:grid-cols-[2fr,1.2fr]">
            <div className="space-y-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-40 w-full" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        )}

        {/* Main content */}
        {!loading && profile && (
          <div className="grid gap-6 md:grid-cols-[2fr,1.2fr]">
            {/* Profile form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950/60"
            >
              <h2 className="text-sm font-semibold">Profile</h2>

              <div className="space-y-2">
                <label className="block text-xs font-medium">
                  Display name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm
                             focus:outline-none focus:ring-2 focus:ring-sky-500
                             dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-medium">
                  Avatar URL
                </label>
                <input
                  type="url"
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  placeholder="https://example.com/avatar.png"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm
                             focus:outline-none focus:ring-2 focus:ring-sky-500
                             dark:border-slate-700 dark:bg-slate-900"
                />
                <p className="text-[11px] text-slate-500">
                  Upload support can be added later with Firebase Storage.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  id="onboardingCompleted"
                  type="checkbox"
                  checked={onboardingCompleted}
                  onChange={(e) =>
                    setOnboardingCompleted(e.target.checked)
                  }
                  className="h-4 w-4 rounded border-slate-300 text-sky-500
                             focus:ring-sky-500 dark:border-slate-700"
                />
                <label
                  htmlFor="onboardingCompleted"
                  className="text-xs"
                >
                  I’ve completed onboarding
                </label>
              </div>

              <button
                type="submit"
                className="mt-2 inline-flex items-center justify-center rounded-lg
                           bg-sky-500 px-4 py-2.5 text-sm font-medium text-white
                           hover:bg-sky-400 transition-colors"
              >
                Save changes
              </button>
            </form>

            {/* Read-only account info */}
            <aside className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 text-sm
                              dark:border-slate-800 dark:bg-slate-950/60">
              <h2 className="text-sm font-semibold">Account</h2>

              <div className="space-y-1">
                <p>
                  <span className="text-slate-500">Email:</span>{" "}
                  <span className="font-medium">
                    {profile.email ?? user.email}
                  </span>
                </p>
                <p>
                  <span className="text-slate-500">Role:</span>{" "}
                  <span className="font-medium">
                    {profile.role}
                  </span>
                </p>
                <p>
                  <span className="text-slate-500">Auth provider:</span>{" "}
                  <span className="font-medium">
                    {profile.authProvider === "google"
                      ? "Google"
                      : "Email & password"}
                  </span>
                </p>
                <p>
                  <span className="text-slate-500">Created:</span>{" "}
                  {profile.createdAt}
                </p>
                <p>
                  <span className="text-slate-500">Last login:</span>{" "}
                  {profile.lastLoginAt}
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
