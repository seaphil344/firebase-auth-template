"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { ensureUserProfile } from "@/lib/userProfile";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("from") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function createSession(idToken: string) {
    const res = await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
      credentials: "include",
    });
  
    if (!res.ok) {
      throw new Error("Failed to establish server session");
    }
  }  

  async function handleEmailLogin(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);

      await ensureUserProfile(cred.user);

      // 🔐 Create HttpOnly session cookie via server
      const idToken = await cred.user.getIdToken();
      await createSession(idToken);

      router.replace(redirectTo);
    } catch (err: unknown) {
      let message = "Failed to sign in";
      if (err instanceof Error && err.message) {
        message = err.message;
      }
      setError(message);
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

      await ensureUserProfile(cred.user);

      const idToken = await cred.user.getIdToken();
      await createSession(idToken);

      router.replace(redirectTo);
    } catch (err: unknown) {
      const maybeFirebaseErr = err as { code?: string } | undefined;
      if (maybeFirebaseErr?.code === "auth/popup-closed-by-user") {
        // ignore silently
      } else {
        let message = "Google sign-in failed";
        if (err instanceof Error && err.message) {
          message = err.message;
        }
        setError(message);
      }
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm space-y-4 border p-6 rounded-lg">
        <h1 className="text-xl font-semibold">Login</h1>

        {error && <p className="text-sm text-red-600">{error}</p>}

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

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="flex-1 h-px bg-gray-200" />
          <span>or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full py-2 border rounded text-sm flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {googleLoading ? "Signing in with Google…" : "Continue with Google"}
        </button>

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
