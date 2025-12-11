"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { ensureUserProfile } from "@/lib/userProfile"
import { getErrorMessage } from "@/lib/errors";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Optional redirect target after login (?from=/dashboard)
  const redirectTo = searchParams.get("from") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleEmailLogin(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);

      // ✅ Ensure Firestore user profile exists & metadata is updated
      await ensureUserProfile(cred.user);

      // ✅ Set middleware auth cookie (7 days)
      document.cookie = `auth=1; path=/; max-age=${7 * 24 * 60 * 60}`;

      router.replace(redirectTo);
    } catch (err: unknown) {
        setError(getErrorMessage(err, "Failed to sign in"));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError(null);
    setGoogleLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);

      // ✅ Ensure Firestore user profile exists & metadata is updated
      await ensureUserProfile(cred.user);

      // ✅ Set middleware auth cookie
      document.cookie = `auth=1; path=/; max-age=${7 * 24 * 60 * 60}`;

      router.replace(redirectTo);
    } catch (err: unknown) {
        // ignore popup closed
        const firebaseErr = err as { code?: string } | undefined;
        if (firebaseErr?.code !== "auth/popup-closed-by-user") {
            setError(getErrorMessage(err, "Google sign-in failed"));
        }
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm space-y-4 border p-6 rounded-lg">
        <h1 className="text-xl font-semibold">Login</h1>

        {error && (
          <p className="text-sm text-red-600">
            {error}
          </p>
        )}

        {/* Email / password login */}
        <form onSubmit={handleEmailLogin} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded bg-black text-white text-sm disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="flex-1 h-px bg-gray-200" />
          <span>or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Google login */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full py-2 border rounded text-sm flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {googleLoading ? "Signing in with Google…" : "Continue with Google"}
        </button>

        {/* Links */}
        <div className="flex justify-between text-xs mt-2">
          <button
            type="button"
            className="underline"
            onClick={() => router.push("/register")}
          >
            Create account
          </button>

          <button
            type="button"
            className="underline"
            onClick={() => router.push("/reset-password")}
          >
            Forgot password?
          </button>
        </div>
      </div>
    </div>
  );
}
