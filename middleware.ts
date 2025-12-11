// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = ["/dashboard", "/settings"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect specific paths
  const isProtectedRoute = PROTECTED_PATHS.some((base) =>
    pathname === base || pathname.startsWith(`${base}/`)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Look for the HttpOnly session cookie
  const hasSession = !!request.cookies.get("session")?.value;

  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*"],
};
