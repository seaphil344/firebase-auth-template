"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
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
    let message = "Failed to establish secure session";

    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // ignore JSON parse errors
    }

    throw new Error(message);
  }
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleEmailLogin(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);

    try {
      // 1️⃣ Firebase client sign-in
      const cred = await signInWithEmailAndPassword(auth, email, password);

      // 2️⃣ Email verification guard
      if (!cred.user.emailVerified) {
        await signOut(auth);
        toast.error("Please verify your email before signing in.");
        router.replace("/verify-email");
        return;
      }

      // 3️⃣ Ensure Firestore profile exists
      await ensureUserProfile(cred.user);

      // 4️⃣ Create server session
      const idToken = await cred.user.getIdToken();
      await createServerSession(idToken);

      // 5️⃣ Success → redirect
      toast.success("Welcome back!");
      router.replace(redirectTo);
    } catch (err) {
      console.error("[login] error:", err);

      // 🔥 CRITICAL: ensure client + server stay in sync
      await signOut(auth);

      const message =
        err instanceof Error
          ? err.message
          : "Unable to sign in. Please try again.";

      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950/60">
        <h1 className="text-xl font-semibold">Sign in</h1>

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
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-medium py-2.5 disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="flex justify-between text-xs">
          <button
            type="button"
            onClick={() => router.push("/reset-password")}
            className="underline underline-offset-2 text-slate-600 dark:text-slate-400"
          >
            Forgot password?
          </button>

          <button
            type="button"
            onClick={() => router.push("/register")}
            className="underline underline-offset-2 text-slate-600 dark:text-slate-400"
          >
            Create account
          </button>
        </div>
      </div>
    </div>
  );
}
