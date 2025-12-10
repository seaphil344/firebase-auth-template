// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /dashboard (and subpaths)
  // You can add more patterns later if needed.
  const isProtectedRoute = pathname.startsWith("/dashboard");

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Check for our simple auth cookie
  const hasAuthCookie = request.cookies.get("auth")?.value === "1";

  if (!hasAuthCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname); // optional "return to" info
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Limit middleware to specific routes
export const config = {
  matcher: ["/dashboard/:path*"],
};
