// app/api/session/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";
import { logUserActivity, logAuditEvent } from "@/lib/activityLogger";

const SESSION_COOKIE_NAME = "session";
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { idToken } = (await request.json()) as { idToken?: string };
    if (!idToken) {
      return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
    }

    const decoded = await adminAuth.verifyIdToken(idToken, true);

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_MAX_AGE_MS,
    });

    const res = NextResponse.json({ success: true });

    res.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionCookie,
      maxAge: SESSION_MAX_AGE_MS / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    // 🔥 LOG LOGIN
    await logUserActivity({
      userId: decoded.uid,
      type: "auth.login",
      message: "Signed in",
    });

    await logAuditEvent({
      actorUserId: decoded.uid,
      action: "user.login",
      ip: request.headers.get("x-forwarded-for") ?? undefined,
      userAgent: request.headers.get("user-agent") ?? undefined,
    });

    return res;
  } catch (err) {
    console.error("[POST /api/session] error:", err);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

export async function DELETE(request: NextRequest) {
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

  try {
    const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (cookie) {
      const decoded = await adminAuth.verifySessionCookie(cookie);

      // 🔥 LOG LOGOUT
      await logUserActivity({
        userId: decoded.uid,
        type: "auth.logout",
        message: "Signed out",
      });

      await logAuditEvent({
        actorUserId: decoded.uid,
        action: "user.logout",
      });
    }
  } catch {
    // Ignore invalid/missing cookie
  }

  return res;
}
