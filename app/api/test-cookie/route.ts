import { NextResponse } from "next/server";

export async function GET() {
  const res = NextResponse.json({ ok: true });

  res.cookies.set({
    name: "test_cookie",
    value: "hello",
    maxAge: 60 * 60,
    httpOnly: false, // make it visible in document.cookie too
    secure: false,
    sameSite: "lax",
    path: "/",
  });

  return res;
}
