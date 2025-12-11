// app/error.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // You can also send this to a logging service
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <div className="max-w-md mx-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-4 shadow-xl shadow-black/40">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold">Something went wrong</h1>
            <p className="text-sm text-slate-400">
              An unexpected error occurred while rendering this page.
            </p>
          </div>

          {/* Optional: show a tiny error hint in dev */}
          {process.env.NODE_ENV !== "production" && (
            <p className="text-[11px] text-slate-500 break-words">
              <span className="font-medium">Error:</span> {error.message}
            </p>
          )}

          <div className="flex flex-col gap-2 text-sm">
            <button
              type="button"
              onClick={() => reset()}
              className="w-full rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-medium py-2.5 transition-colors"
            >
              Try again
            </button>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <Link
                href="/"
                className="underline underline-offset-2 hover:text-sky-300"
              >
                Go to home
              </Link>
              <Link
                href="/dashboard"
                className="underline underline-offset-2 hover:text-sky-300"
              >
                Open dashboard
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
