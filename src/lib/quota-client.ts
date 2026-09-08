"use client";

import { useAppStore } from "@/store/use-store";
import { getAnonymousId } from "@/lib/anonymous-session";

export async function refreshUserQuota() {
  try {
    const { user, setIsAdmin, setQuota } = useAppStore.getState();

    if (user) {
      const res = await fetch("/api/quota");
      const data = await res.json();
      if (data.error) return;
      setIsAdmin(data.isAdmin === true);
      setQuota({
        type: data.isAuthenticated ? "google" : "free",
        total:
          data.type === "free"
            ? data.freeTotal
            : data.googleTotal + data.tokenBalance,
        used: data.googleUsed,
        remaining: data.totalRemaining,
      });
    } else {
      const anonymousId = getAnonymousId();
      const res = await fetch(
        `/api/quota${
          anonymousId ? `?anonymousId=${encodeURIComponent(anonymousId)}` : ""
        }`
      );
      const data = await res.json();
      if (data.error || data.isAuthenticated) return;
      setQuota({
        type: "free",
        total: data.freeTotal,
        used: data.freeUsed,
        remaining: data.totalRemaining,
      });
    }
  } catch {
    // silently ignore failed quota refresh
  }
}