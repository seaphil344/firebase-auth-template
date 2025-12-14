// lib/activityLogger.ts
import { adminDb } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";

type ActivityType =
  | "auth.login"
  | "auth.logout"
  | "profile.update"
  | "settings.update";

export async function logUserActivity(params: {
  userId: string;
  type: ActivityType;
  message: string;
  metadata?: Record<string, unknown>;
}) {
  await adminDb.collection("user_activity").add({
    ...params,
    createdAt: Timestamp.now(),
  });
}

export async function logAuditEvent(params: {
  actorUserId: string | null;
  action: string;
  targetUserId?: string;
  severity?: "info" | "warning" | "critical";
  ip?: string;
  userAgent?: string;
}) {
  await adminDb.collection("audit_logs").add({
    ...params,
    severity: params.severity ?? "info",
    createdAt: Timestamp.now(),
  });
}
