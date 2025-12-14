"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "@/lib/firebaseClient";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleRegister(e: FormEvent) {
    e.preventDefault();

    toast.promise(
      (async () => {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(cred.user);
      })(),
      {
        loading: "Creating your account...",
        success: "Account created! Check your email to verify.",
        error: "Could not create account. Please try again.",
      }
    );

    // Optional: route immediately to verify page
    router.replace("/verify-email");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950/60">
        <h1 className="text-xl font-semibold">Create account</h1>

        <form onSubmit={handleRegister} className="space-y-3">
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

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-medium py-2.5"
          >
            Create account
          </button>
        </form>

        <button
          type="button"
          onClick={() => router.push("/login")}
          className="text-xs underline underline-offset-2 text-slate-600 dark:text-slate-400"
        >
          Already have an account? Sign in
        </button>
      </div>
    </div>
  );
}
