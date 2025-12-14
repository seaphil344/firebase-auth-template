"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { useAuth } from "@/components/AuthProvider";
import { Skeleton } from "@/components/Skeleton";

type Activity = {
  message: string;
  createdAt?: { toDate: () => Date };
};

export default function ActivityPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "user_activity"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(20)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const rows = snapshot.docs.map((doc) => doc.data() as Activity);
        setItems(rows);
        setLoading(false);
      },
      (error) => {
        console.error("Activity subscription error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Activity</h1>

      {loading && <Skeleton className="h-32 w-full" />}

      {!loading && items.length === 0 && (
        <p className="text-sm text-slate-500">
          No activity yet.
        </p>
      )}

      <ul className="space-y-2">
        {items.map((a, i) => (
          <li
            key={i}
            className="rounded-lg border border-slate-200 bg-white p-3 text-sm
                       dark:border-slate-800 dark:bg-slate-950/60"
          >
            <div className="font-medium">{a.message}</div>
            <div className="text-xs text-slate-500">
              {a.createdAt
                ? a.createdAt.toDate().toLocaleString()
                : ""}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
