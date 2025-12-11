// lib/serverAuth.ts
import { cookies } from "next/headers";
import { adminAuth } from "./firebaseAdmin";

const SESSION_COOKIE_NAME = "session";

export async function getServerUser() {
  // cookies() must be awaited in Node.js runtime
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    return decoded; // uid, email, etc.
  } catch (err) {
    console.error("[getServerUser] session verify failed:", err);
    return null;
  }
}
