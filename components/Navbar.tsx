"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { useAuth } from "./AuthProvider";
import { useUserProfile } from "@/lib/hooks/useUserProfile";

export default function Navbar() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();

  async function handleSignOut() {
    await signOut(auth);

    // ✅ Clear middleware auth cookie
    document.cookie = "auth=; path=/; max-age=0";

    router.replace("/login");
  }

  const isLoading = authLoading || profileLoading;

  const displayName =
    profile?.displayName ??
    user?.displayName ??
    user?.email ??
    "User";

  const avatarURL =
    profile?.photoURL ??
    user?.photoURL ??
    null;

  return (
    <header className="w-full border-b">
      <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="text-lg font-semibold">
          MyApp
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4 text-sm">
          {isLoading && (
            <span className="text-gray-500 text-xs">
              Loading…
            </span>
          )}

          {!isLoading && !user && (
            <>
              <Link href="/login" className="hover:underline">
                Login
              </Link>
              <Link href="/register" className="hover:underline">
                Register
              </Link>
            </>
          )}

          {!isLoading && user && (
            <>
              <Link href="/dashboard" className="hover:underline">
                Dashboard
              </Link>

              {/* User info */}
              <div className="flex items-center gap-3">
                {avatarURL ? (
                  <img
                    src={avatarURL}
                    alt={displayName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}

                <span className="hidden sm:inline text-xs text-gray-700">
                  {displayName}
                  {profile?.role === "admin" && (
                    <span className="ml-1 text-[10px] uppercase text-gray-500">
                      (admin)
                    </span>
                  )}
                </span>

                <button
                  onClick={handleSignOut}
                  className="hover:underline text-xs"
                >
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
