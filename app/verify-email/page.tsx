"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { sendEmailVerification, reload } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { useAuth } from "@/components/AuthProvider";
import { ensureUserProfile } from "@/lib/userProfile";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkVerified() {
      if (!user || cancelled) return;

      await reload(user);

      if (!cancelled && user.emailVerified) {
        // Create profile now that verified
        await ensureUserProfile(user);

        toast.success("Email verified! Redirecting…");
        router.replace("/dashboard");
      }
    }

    void checkVerified();

    return () => {
      cancelled = true;
    };
  }, [user, router]);

  async function handleResend() {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    setSending(true);

    try {
      await sendEmailVerification(currentUser);
      toast("Verification email sent. Check your inbox.");
    } catch (err) {
      toast.error("Could not send verification email. Try again soon.");
    } finally {
      setSending(false);
    }
  }

  if (loading) return null;
  if (!user) {
    router.replace("/login");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950/60">
        <h1 className="text-xl font-semibold">Verify your email</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          We sent a verification link to <span className="font-medium">{user.email}</span>.
          After you verify, come back here and this page will redirect you automatically.
        </p>

        <button
          onClick={handleResend}
          disabled={sending}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-sm hover:border-sky-500 hover:text-sky-500 disabled:opacity-60"
        >
          {sending ? "Sending…" : "Resend verification email"}
        </button>

        <button
          onClick={() => router.replace("/login")}
          className="text-xs underline underline-offset-2 text-slate-600 dark:text-slate-400"
        >
          Back to login
        </button>
      </div>
    </div>
  );
}
