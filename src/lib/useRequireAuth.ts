"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "./store";
import type { User } from "./types";

/**
 * Redirects to /login once we know there is no session. Returns the signed-in
 * user, or null while the session is still hydrating / redirecting.
 */
export function useRequireAuth(): { user: User | null; ready: boolean } {
  const { currentUser, authReady } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (authReady && !currentUser) {
      router.replace("/login");
    }
  }, [authReady, currentUser, router]);

  return { user: currentUser, ready: authReady };
}
