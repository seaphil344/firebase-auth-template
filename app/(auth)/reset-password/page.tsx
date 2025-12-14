"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  async function handleReset(e: FormEvent) {
    e.preventDefault();

    toast.promise(
      sendPasswordResetEmail(auth, email),
      {
        loading: "Sending reset email…",
        success: "Password reset email sent. Check your inbox.",
        error: "Could not send reset email. Double-check the address.",
      }
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950/60">
        <h1 className="text-xl font-semibold">Reset password</h1>

        <form onSubmit={handleReset} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-medium py-2.5"
          >
            Send reset link
          </button>
        </form>

        <button
          type="button"
          onClick={() => router.push("/login")}
          className="text-xs underline underline-offset-2 text-slate-600 dark:text-slate-400"
        >
          Back to login
        </button>
      </div>
    </div>
  );
}
