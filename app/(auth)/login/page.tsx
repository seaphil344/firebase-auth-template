"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { toast } from "sonner";
import { auth } from "@/lib/firebaseClient";
import { ensureUserProfile } from "@/lib/userProfile";

async function createServerSession(idToken: string) {
  const res = await fetch("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ idToken }),
  });

  if (!res.ok) {
    let message = "Failed to establish secure session.";
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // middleware uses `from=/dashboard` so we honor that
  const redirectTo = searchParams.get("from") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  const busy = emailSubmitting || googleSubmitting;

  async function finishLogin(user: { getIdToken: () => Promise<string>; emailVerified: boolean }) {
    // If you enforce verification for email/password accounts, keep it consistent:
    // Google accounts are typically verified already, but this also covers edge cases.
    if (!user.emailVerified) {
      await signOut(auth);
      toast.error("Please verify your email before signing in.");
      router.replace("/verify-email");
      return;
    }

    // Ensure user profile exists (your existing helper)
    // (If your ensureUserProfile needs the full Firebase User type, pass the actual user object below.)
    // @ts-expect-error - typed loosely for reuse; your project user type is Firebase User
    await ensureUserProfile(user);

    const idToken = await user.getIdToken();
    await createServerSession(idToken);

    toast.success("Signed in!");
    router.replace(redirectTo);
  }

  async function handleEmailLogin(e: FormEvent) {
    e.preventDefault();
    if (busy) return;

    setEmailSubmitting(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await finishLogin(cred.user);
    } catch (err: unknown) {
      console.error("[email login] error:", err);
      await signOut(auth);

      const message =
        err instanceof Error && err.message ? err.message : "Unable to sign in.";
      toast.error(message);
    } finally {
      setEmailSubmitting(false);
    }
  }

  async function handleGoogleLogin() {
    if (busy) return;

    setGoogleSubmitting(true);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      await finishLogin(cred.user);
      toast.success("Signed in with Google!");
    } catch (err: unknown) {
      // Common non-error: user closes the popup
      const maybe = err as { code?: string };
      if (maybe?.code === "auth/popup-closed-by-user") {
        toast("Sign-in cancelled.");
      } else {
        console.error("[google login] error:", err);
        await signOut(auth);

        const message =
          err instanceof Error && err.message
            ? err.message
            : "Google sign-in failed.";
        toast.error(message);
      }
    } finally {
      setGoogleSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950/60">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Sign in</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Continue to your dashboard.
          </p>
        </div>

        {/* Email/password */}
        <form onSubmit={handleEmailLogin} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              disabled={busy}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              disabled={busy}
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-medium py-2.5 disabled:opacity-60"
          >
            {emailSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
          <span>or</span>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={busy}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-sm
                     hover:border-sky-500 hover:text-sky-500 disabled:opacity-60 transition-colors"
        >
          {googleSubmitting ? "Signing in…" : "Continue with Google"}
        </button>

        {/* Links */}
        <div className="flex justify-between text-xs pt-1">
          <button
            type="button"
            onClick={() => router.push("/reset-password")}
            className="underline underline-offset-2 text-slate-600 dark:text-slate-400"
            disabled={busy}
          >
            Forgot password?
          </button>

          <button
            type="button"
            onClick={() => router.push("/register")}
            className="underline underline-offset-2 text-slate-600 dark:text-slate-400"
            disabled={busy}
          >
            Create account
          </button>
        </div>
      </div>
    </div>
  );
}
