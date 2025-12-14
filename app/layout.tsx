import type { ReactNode } from "react";
import { AuthProvider } from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import { Toaster } from "sonner";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
        <ThemeProvider>
          <AuthProvider>
            <Navbar />

            {/* GLOBAL TOASTER */}
            <Toaster
              richColors
              closeButton
              position="top-right"
              theme="system"
            />

            <main className="max-w-6xl mx-auto px-4 py-6">
              {children}
            </main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
