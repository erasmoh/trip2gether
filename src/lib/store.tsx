"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase/client";
import { fetchProfile, updateProfile } from "./supabase/queries";
import type { User } from "./types";

export interface OtpRequestResult {
  ok: boolean;
  error?: string;
}

export type OtpVerifyStatus = "ok" | "needs_registration" | "error";

export interface OtpVerifyResult {
  status: OtpVerifyStatus;
  error?: string;
}

interface StoreValue {
  /** The signed-in user's profile, or null when logged out. */
  currentUser: User | null;
  /** False until the initial session check has resolved on the client. */
  authReady: boolean;
  /** Passwordless OTP: ask Supabase Auth to email a 6-digit code to an invited address. */
  requestOtp: (email: string) => Promise<OtpRequestResult>;
  /** Verify the code. Returns "needs_registration" for first-time invitees. */
  verifyOtp: (email: string, token: string) => Promise<OtpVerifyResult>;
  /** Complete first-time registration (set name) for the already-verified session. */
  completeRegistration: (fullName: string) => Promise<OtpVerifyResult>;
  signOut: () => Promise<void>;
}

const StoreContext = createContext<StoreValue | null>(null);

// A profile row can lag a beat behind the trigger that creates it right after
// signup; give it one short retry before giving up.
async function fetchProfileWithRetry(userId: string): Promise<User | null> {
  const first = await fetchProfile(userId);
  if (first) return first;
  await new Promise((resolve) => setTimeout(resolve, 400));
  return fetchProfile(userId);
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const syncFromSession = useCallback(async (session: Session | null) => {
    if (!session?.user) {
      setCurrentUser(null);
      return;
    }
    const profile = await fetchProfileWithRetry(session.user.id);
    setCurrentUser(profile);
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      syncFromSession(session).finally(() => {
        if (mounted) setAuthReady(true);
      });
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      syncFromSession(session).finally(() => {
        if (mounted) setAuthReady(true);
      });
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [syncFromSession]);

  // Mirrors supabase.auth.signInWithOtp({ email }). shouldCreateUser: true
  // (registro abierto) lets anyone sign up with just an email — no invite
  // required. Seeing a given trip is still gated separately by trip_members
  // + RLS once the account exists.
  const requestOtp = useCallback(async (email: string): Promise<OtpRequestResult> => {
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    });
    if (error) {
      return { ok: false, error: error.message };
    }
    return { ok: true };
  }, []);

  // Mirrors supabase.auth.verifyOtp({ email, token, type: 'email' }).
  const verifyOtp = useCallback(
    async (email: string, token: string): Promise<OtpVerifyResult> => {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: token.trim(),
        type: "email",
      });
      if (error || !data.user) {
        return { status: "error", error: "Código incorrecto o expirado." };
      }
      const profile = await fetchProfileWithRetry(data.user.id);
      setCurrentUser(profile);
      if (!profile || !profile.registered) {
        return { status: "needs_registration" };
      }
      return { status: "ok" };
    },
    [],
  );

  const completeRegistration = useCallback(
    async (fullName: string): Promise<OtpVerifyResult> => {
      const name = fullName.trim();
      if (!name) return { status: "error", error: "El nombre es obligatorio." };
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { status: "error", error: "Tu sesión expiró, vuelve a intentarlo." };
      const profile = await updateProfile(user.id, { fullName: name, registered: true });
      setCurrentUser(profile);
      return { status: "ok" };
    },
    [],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      currentUser,
      authReady,
      requestOtp,
      verifyOtp,
      completeRegistration,
      signOut,
    }),
    [currentUser, authReady, requestOtp, verifyOtp, completeRegistration, signOut],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return ctx;
}
