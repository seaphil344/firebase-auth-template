// app/login/page.tsx
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { ensureUserProfile } from "@/lib/userProfile";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      console.log("[login] signing in with email/password...");
      const cred = await signInWithEmailAndPassword(auth, email, password);
      console.log("[login] signed in:", cred.user.uid);

      await ensureUserProfile(cred.user);

      router.replace("/dashboard");
    } catch (err: any) {
      console.error("[login] error:", err);
      setError(err.message ?? "Failed to sign in");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    setGoogleLoading(true);

    try {
      console.log("[login] signing in with Google...");
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      console.log("[login] Google signed in:", cred.user.uid);

      await ensureUserProfile(cred.user);

      router.replace("/dashboard");
    } catch (err: any) {
      if (err?.code !== "auth/popup-closed-by-user") {
        console.error("[login] Google error:", err);
        setError(err.message ?? "Google sign-in failed");
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

        {/* Email/password form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded bg-black text-white text-sm disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="flex-1 h-px bg-gray-200" />
          <span>or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Google button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="w-full py-2 border rounded text-sm flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {googleLoading ? "Signing in with Google..." : "Continue with Google"}
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
