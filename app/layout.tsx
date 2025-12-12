// app/layout.tsx
import type { ReactNode } from "react";
import { AuthProvider } from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider"
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main className="max-w-6xl mx-auto px-4 py-6">
              {children}
            </main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
