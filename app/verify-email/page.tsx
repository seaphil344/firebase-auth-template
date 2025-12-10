// app/verify-email/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sendEmailVerification } from "firebase/auth";
import { useAuth } from "@/components/AuthProvider";
import { auth } from "@/lib/firebaseClient";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [status, setStatus] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // If not logged in, go to login
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  async function handleResend() {
    if (!user) return;
    setStatus(null);
    setActionLoading(true);

    try {
      await sendEmailVerification(user);
      setStatus("Verification email sent. Check your inbox.");
    } catch (err: any) {
      setStatus(err.message ?? "Failed to send verification email.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCheckVerified() {
    if (!user) return;
    setStatus(null);
    setActionLoading(true);

    try {
      // Reload the Firebase user to get fresh emailVerified status
      await user.reload();

      if (user.emailVerified) {
        setStatus("Email verified! Redirecting…");
        router.replace("/dashboard");
      } else {
        setStatus("Still not verified. Make sure you clicked the link in your email.");
      }
    } catch (err: any) {
      setStatus(err.message ?? "Failed to check verification status.");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-600">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md border rounded-lg p-6 space-y-4">
        <h1 className="text-xl font-semibold">Verify your email</h1>

        <p className="text-sm text-gray-700">
          We&apos;ve sent a verification link to{" "}
          <span className="font-medium">{user.email}</span>. <br />
          Please click the link in that email to verify your account.
        </p>

        {status && <p className="text-sm text-blue-600">{status}</p>}

        <div className="flex flex-col gap-2">
          <button
            onClick={handleResend}
            disabled={actionLoading}
            className="w-full py-2 border rounded text-sm disabled:opacity-60"
          >
            {actionLoading ? "Sending…" : "Resend verification email"}
          </button>

          <button
            onClick={handleCheckVerified}
            disabled={actionLoading}
            className="w-full py-2 rounded bg-black text-white text-sm disabled:opacity-60"
          >
            {actionLoading ? "Checking…" : "I verified, re-check"}
          </button>
        </div>
      </div>
    </div>
  );
}
