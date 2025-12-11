"use client";

import { FormEvent, useEffect, useState } from "react";
import { updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { AuthGuard } from "@/components/AuthGuard";
import { useAuth } from "@/components/AuthProvider";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { updateUserProfile } from "@/lib/userProfile";

export default function SettingsPage() {
  const { user } = useAuth();
  const { profile, loading } = useUserProfile();

  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Sync form fields from profile when it loads
  useEffect(() => {
    let cancelled = false;

    function syncForm() {
      if (!profile || cancelled) return;
      setDisplayName(profile.displayName ?? "");
      setPhotoURL(profile.photoURL ?? "");
      setOnboardingCompleted(profile.onboardingCompleted ?? false);
    }

    syncForm();

    return () => {
      cancelled = true;
    };
  }, [profile]);

  if (!user) {
    // AuthGuard will handle redirect, but this keeps TS/React happy
    return null;
  }

  const createdAt = profile?.createdAt ?? "—";
  const lastLoginAt = profile?.lastLoginAt ?? "—";
  const role = profile?.role ?? "user";
  const provider = profile?.authProvider ?? "password";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setError("You are not currently signed in.");
        setSaving(false);
        return;
      }

      // Update Firebase Auth profile (for displayName/photoURL)
      await updateProfile(currentUser, {
        displayName: displayName || null,
        photoURL: photoURL || null,
      });

      // Update Firestore user profile
      await updateUserProfile(currentUser.uid, {
        displayName: displayName || null,
        photoURL: photoURL || null,
        onboardingCompleted,
      });

      setSuccess("Your settings have been saved.");
    } catch (err: unknown) {
      // Basic safe error extraction
      let message = "Failed to update settings.";
      if (err instanceof Error && err.message) {
        message = err.message;
      }
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AuthGuard>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Account settings</h1>
          <p className="text-sm text-slate-400">
            Manage your profile information and account preferences.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-[2fr,1.2fr]">
          {/* Left: editable profile form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4 sm:p-5"
          >
            <h2 className="text-sm font-semibold mb-1">Profile</h2>
            <p className="text-xs text-slate-400 mb-2">
              This information is visible in the app UI.
            </p>

            {error && (
              <div className="rounded-md border border-red-500/70 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-md border border-emerald-500/70 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
                {success}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-200">
                Display name
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs sm:text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                placeholder="How you appear in the app"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={loading || saving}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-200">
                Avatar URL
              </label>
              <input
                type="url"
                className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs sm:text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                placeholder="https://example.com/avatar.png"
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
                disabled={loading || saving}
              />
              <p className="text-[11px] text-slate-500">
                In a future version you can swap this for a real upload field.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                id="onboardingCompleted"
                type="checkbox"
                className="h-3.5 w-3.5 rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-sky-500"
                checked={onboardingCompleted}
                onChange={(e) => setOnboardingCompleted(e.target.checked)}
                disabled={loading || saving}
              />
              <label
                htmlFor="onboardingCompleted"
                className="text-xs text-slate-200"
              >
                I&apos;ve completed onboarding
              </label>
            </div>

            <button
              type="submit"
              disabled={saving || loading}
              className="mt-3 inline-flex items-center justify-center rounded-lg bg-sky-500 hover:bg-sky-400 disabled:bg-sky-600/60 text-xs sm:text-sm font-medium px-4 py-2.5 transition-colors"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </form>

          {/* Right: read-only account info */}
          <aside className="space-y-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4 sm:p-5 text-xs sm:text-sm">
            <h2 className="text-sm font-semibold mb-1">Account</h2>
            <p className="text-[11px] text-slate-400 mb-3">
              Read-only details about your account.
            </p>

            <div className="space-y-1">
              <p>
                <span className="text-slate-400">Email:</span>{" "}
                <span className="font-medium text-slate-100">
                  {profile?.email ?? user.email ?? "—"}
                </span>
              </p>
              <p>
                <span className="text-slate-400">Role:</span>{" "}
                <span className="font-medium text-slate-100">{role}</span>
              </p>
              <p>
                <span className="text-slate-400">Auth provider:</span>{" "}
                <span className="font-medium text-slate-100">
                  {provider === "google" ? "Google" : "Email & password"}
                </span>
              </p>
              <p>
                <span className="text-slate-400">Created:</span>{" "}
                <span className="text-slate-100">{createdAt}</span>
              </p>
              <p>
                <span className="text-slate-400">Last login:</span>{" "}
                <span className="text-slate-100">{lastLoginAt}</span>
              </p>
            </div>
          </aside>
        </div>
      </div>
    </AuthGuard>
  );
}
