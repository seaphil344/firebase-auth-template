// app/api/session/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";

const SESSION_COOKIE_NAME = "session";
const SESSION_MAX_AGE_DAYS = 7;
const SESSION_MAX_AGE_MS = SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null) as { idToken?: string } | null;

    if (!body?.idToken || typeof body.idToken !== "string") {
      console.error("[POST /api/session] Missing idToken in body:", body);
      return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
    }

    const { idToken } = body;

    console.log("[POST /api/session] Received idToken (first 20 chars):", idToken.slice(0, 20));

    // Verify the Firebase ID token with Admin SDK
    const decoded = await adminAuth.verifyIdToken(idToken, true);
    console.log("[POST /api/session] Token verified for uid:", decoded.uid);

    const expiresIn = SESSION_MAX_AGE_MS;
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn,
    });

    console.log("[POST /api/session] Created session cookie");

    const res = NextResponse.json({
      success: true,
      uid: decoded.uid,
    });

    res.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionCookie,
      maxAge: expiresIn / 1000, // seconds
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    console.log("[POST /api/session] Set-Cookie header prepared");

    return res;
  } catch (err) {
    console.error("[POST /api/session] error:", err);
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });

  res.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  console.log("[DELETE /api/session] Cleared session cookie");

  return res;
}
