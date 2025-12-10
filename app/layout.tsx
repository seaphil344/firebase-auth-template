import type { ReactNode } from "react";
import { AuthProvider } from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <main className="max-w-6xl mx-auto px-4 py-6">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
