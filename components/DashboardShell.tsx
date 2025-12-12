// components/DashboardShell.tsx
"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { Skeleton } from "@/components/Skeleton";

type DashboardShellProps = {
  children: ReactNode;
};

const navItems = [
  { label: "Overview", href: "/dashboard" },
  // You can add more later, e.g.:
  // { label: "Projects", href: "/dashboard/projects" },
];

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const { profile, loading } = useUserProfile();

  return (
    <AuthGuard>
      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="w-56 shrink-0 hidden md:flex flex-col gap-4 border border-slate-200 bg-white rounded-xl p-4 dark:border-slate-800 dark:bg-slate-950/60">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Workspace
            </p>
            {loading ? (
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex flex-col gap-1 flex-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-2 w-16" />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[11px] font-medium text-slate-700 dark:text-slate-100">
                  {(profile?.displayName ?? profile?.email ?? "U")
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-xs font-medium text-slate-900 dark:text-slate-50">
                    {profile?.displayName ?? profile?.email ?? "User"}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {profile?.role === "admin" ? "Admin" : "Member"}
                  </span>
                </div>
              </div>
            )}
          </div>

          <nav className="space-y-1 text-xs">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.12em]">
              Navigation
            </p>
            <div className="mt-1 space-y-1">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      "flex items-center justify-between rounded-md px-3 py-2 transition-colors",
                      isActive
                        ? "bg-sky-500/10 text-sky-700 border border-sky-500/40 dark:text-sky-200 dark:border-sky-500/40"
                        : "text-slate-700 hover:bg-slate-100 border border-transparent dark:text-slate-200 dark:hover:bg-slate-900",
                    ].join(" ")}
                  >
                    <span className="text-xs">{item.label}</span>
                    {isActive && (
                      <span className="text-[10px] uppercase text-sky-500 dark:text-sky-300">
                        active
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="mt-auto pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
            <p>Need more sections? Add them here later (e.g. &quot;Projects&quot;, &quot;Teams&quot;).</p>
          </div>
        </aside>

        {/* Main content */}
        <section className="flex-1 min-w-0">
          {children}
        </section>
      </div>
    </AuthGuard>
  );
}
