"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, loading } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOut(auth);
    router.replace("/login");
  }

  return (
    <header className="w-full border-b">
      <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo / Brand */}
        <Link href="/" className="text-lg font-semibold">
          MyApp
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4 text-sm">
          {!loading && !user && (
            <>
              <Link href="/login" className="hover:underline">
                Login
              </Link>
              <Link href="/register" className="hover:underline">
                Register
              </Link>
            </>
          )}

          {!loading && user && (
            <>
              <Link href="/dashboard" className="hover:underline">
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="hover:underline"
              >
                Sign out
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
