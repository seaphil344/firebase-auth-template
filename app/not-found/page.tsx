// app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <div className="max-w-md mx-4 text-center space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
              404
            </p>
            <h1 className="text-2xl font-semibold">Page not found</h1>
            <p className="text-sm text-slate-400">
              The page you&apos;re looking for doesn&apos;t exist, was moved, or
              you might not have access to it.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-sm mt-2">
            <Link
              href="/"
              className="w-full sm:w-auto rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-medium px-4 py-2.5 transition-colors"
            >
              Back to home
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto rounded-lg border border-slate-700 hover:border-sky-500 hover:text-sky-300 px-4 py-2.5 transition-colors"
            >
              Go to dashboard
            </Link>
          </div>

          <p className="text-[11px] text-slate-500 mt-2">
            If you think this is a mistake, try signing in again or checking
            your account permissions.
          </p>
        </div>
      </body>
    </html>
  );
}
