"use client";

import { FormEvent, useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("If an account exists for that email, a reset link has been sent.");
    } catch (err: any) {
      setError(err.message ?? "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 border p-6 rounded-lg">
        <h1 className="text-xl font-semibold">Reset password</h1>

        {message && <p className="text-sm text-green-600">{message}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            className="w-full border rounded px-3 py-2 text-sm"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded bg-black text-white text-sm disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send reset link"}
        </button>
      </form>
    </div>
  );
}
