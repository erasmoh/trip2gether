"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { seedData } from "./mock-data";
import type {
  Activity,
  ActivityWithComments,
  Comment,
  CommentWithUser,
  MemberWithUser,
  Trip,
  TripDay,
  TripMember,
  User,
} from "./types";

interface DataState {
  users: User[];
  trips: Trip[];
  tripMembers: TripMember[];
  activities: Activity[];
  comments: Comment[];
}

interface NewActivityInput {
  dayDate: string;
  startTime: string;
  endTime?: string;
  title: string;
  location?: string;
  description: string;
}

export interface OtpRequestResult {
  ok: boolean;
  error?: string;
  /**
   * The generated code. In production Supabase emails this; here there is no
   * email backend, so we surface it to show in a dev banner on the login page.
   */
  devCode?: string;
}

export type OtpVerifyStatus = "ok" | "needs_registration" | "error";

export interface OtpVerifyResult {
  status: OtpVerifyStatus;
  error?: string;
}

const SESSION_KEY = "trip2gether.session";
const normalizeEmail = (email: string) => email.trim().toLowerCase();

interface StoreValue {
  /** The signed-in user, or null when logged out. */
  currentUser: User | null;
  users: User[];
  /** False until the persisted session has been read on the client. */
  authReady: boolean;
  /** Passwordless OTP: "send" a 6-digit code to an invited email. */
  requestOtp: (email: string) => OtpRequestResult;
  /** Verify the code. Returns "needs_registration" for first-time invitees. */
  verifyOtp: (email: string, token: string) => OtpVerifyResult;
  /** Complete first-time registration (set name) and sign in. */
  completeRegistration: (email: string, fullName: string) => OtpVerifyResult;
  signOut: () => void;
  /** Trips the current user is a member of (access control simulation). */
  visibleTrips: Trip[];
  getTrip: (tripId: string) => Trip | undefined;
  /** Returns undefined if the current user is not a member of the trip. */
  canAccessTrip: (tripId: string) => boolean;
  getMembers: (tripId: string) => MemberWithUser[];
  getDays: (tripId: string) => TripDay[];
  addActivity: (tripId: string, input: NewActivityInput) => void;
  addComment: (activityId: string, body: string) => void;
  /** True if the current user can add/edit itinerary content in this trip. */
  canEditTrip: (tripId: string) => boolean;
  /** True if the current user is the organizer of this trip. */
  isOrganizer: (tripId: string) => boolean;
  /** Grant/revoke a member's edit privilege. Organizer-only in the UI. */
  setMemberCanEdit: (memberId: string, canEdit: boolean) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

let idCounter = 1000;
const nextId = (prefix: string) => `${prefix}_${idCounter++}`;

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<DataState>(() => ({
    users: seedData.users,
    trips: seedData.trips,
    tripMembers: seedData.tripMembers,
    activities: seedData.activities,
    comments: seedData.comments,
  }));
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  // Codes "sent" per email. In production Supabase owns this server-side.
  const otpCodes = useRef<Map<string, string>>(new Map());

  // Hydrate the session from localStorage on the client. Reading storage during
  // render would cause an SSR/client mismatch, so it must happen in an effect.
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = window.localStorage.getItem(SESSION_KEY);
    } catch {
      // ignore storage errors (e.g. disabled cookies)
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentUserId(saved);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAuthReady(true);
  }, []);

  const persistSession = useCallback((userId: string | null) => {
    setCurrentUserId(userId);
    try {
      if (userId) window.localStorage.setItem(SESSION_KEY, userId);
      else window.localStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore storage errors
    }
  }, []);

  const usersById = useMemo(() => {
    const map = new Map<string, User>();
    data.users.forEach((u) => map.set(u.id, u));
    return map;
  }, [data.users]);

  const currentUser = currentUserId ? usersById.get(currentUserId) ?? null : null;

  const findByEmail = useCallback(
    (email: string) =>
      data.users.find((u) => u.email.toLowerCase() === normalizeEmail(email)),
    [data.users],
  );

  // Mirrors supabase.auth.signInWithOtp({ email }). Only invited emails (users
  // that already exist) are accepted, matching shouldCreateUser: false.
  const requestOtp = useCallback(
    (email: string): OtpRequestResult => {
      const user = findByEmail(email);
      if (!user) {
        return {
          ok: false,
          error: "Este correo no tiene invitaciones a ningún viaje.",
        };
      }
      const code = String(Math.floor(100000 + Math.random() * 900000));
      otpCodes.current.set(normalizeEmail(email), code);
      return { ok: true, devCode: code };
    },
    [findByEmail],
  );

  // Mirrors supabase.auth.verifyOtp({ email, token, type: 'email' }).
  const verifyOtp = useCallback(
    (email: string, token: string): OtpVerifyResult => {
      const user = findByEmail(email);
      const expected = otpCodes.current.get(normalizeEmail(email));
      if (!user || !expected || token.trim() !== expected) {
        return { status: "error", error: "Código incorrecto o expirado." };
      }
      otpCodes.current.delete(normalizeEmail(email));
      if (!user.registered) {
        return { status: "needs_registration" };
      }
      persistSession(user.id);
      return { status: "ok" };
    },
    [findByEmail, persistSession],
  );

  const completeRegistration = useCallback(
    (email: string, fullName: string): OtpVerifyResult => {
      const user = findByEmail(email);
      if (!user) return { status: "error", error: "Usuario no encontrado." };
      const name = fullName.trim();
      if (!name) return { status: "error", error: "El nombre es obligatorio." };
      setData((prev) => ({
        ...prev,
        users: prev.users.map((u) =>
          u.id === user.id ? { ...u, fullName: name, registered: true } : u,
        ),
      }));
      persistSession(user.id);
      return { status: "ok" };
    },
    [findByEmail, persistSession],
  );

  const signOut = useCallback(() => persistSession(null), [persistSession]);

  const membershipTripIds = useMemo(() => {
    return new Set(
      data.tripMembers
        .filter((m) => m.userId === currentUserId)
        .map((m) => m.tripId),
    );
  }, [data.tripMembers, currentUserId]);

  const canAccessTrip = useCallback(
    (tripId: string) => membershipTripIds.has(tripId),
    [membershipTripIds],
  );

  const visibleTrips = useMemo(
    () => data.trips.filter((t) => membershipTripIds.has(t.id)),
    [data.trips, membershipTripIds],
  );

  const getTrip = useCallback(
    (tripId: string) => data.trips.find((t) => t.id === tripId),
    [data.trips],
  );

  const getMembers = useCallback(
    (tripId: string): MemberWithUser[] =>
      data.tripMembers
        .filter((m) => m.tripId === tripId)
        .map((m) => ({ ...m, user: usersById.get(m.userId)! }))
        .filter((m) => m.user),
    [data.tripMembers, usersById],
  );

  const getDays = useCallback(
    (tripId: string): TripDay[] => {
      const tripActivities = data.activities.filter((a) => a.tripId === tripId);
      const byDate = new Map<string, ActivityWithComments[]>();

      for (const activity of tripActivities) {
        const activityComments: CommentWithUser[] = data.comments
          .filter((c) => c.activityId === activity.id)
          .map((c) => ({ ...c, user: usersById.get(c.userId)! }))
          .filter((c) => c.user)
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

        const withComments: ActivityWithComments = {
          ...activity,
          comments: activityComments,
        };
        const bucket = byDate.get(activity.dayDate) ?? [];
        bucket.push(withComments);
        byDate.set(activity.dayDate, bucket);
      }

      return Array.from(byDate.entries())
        .map(([date, acts]) => ({
          date,
          activities: acts.sort((a, b) => a.startTime.localeCompare(b.startTime)),
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
    },
    [data.activities, data.comments, usersById],
  );

  const addActivity = useCallback(
    (tripId: string, input: NewActivityInput) => {
      if (!currentUserId) return;
      const activity: Activity = {
        id: nextId("a"),
        tripId,
        createdBy: currentUserId,
        ...input,
      };
      setData((prev) => ({ ...prev, activities: [...prev.activities, activity] }));
    },
    [currentUserId],
  );

  const addComment = useCallback(
    (activityId: string, body: string) => {
      if (!currentUserId) return;
      const comment: Comment = {
        id: nextId("c"),
        activityId,
        userId: currentUserId,
        body,
        createdAt: new Date().toISOString(),
      };
      setData((prev) => ({ ...prev, comments: [...prev.comments, comment] }));
    },
    [currentUserId],
  );

  const currentMembership = useCallback(
    (tripId: string) =>
      data.tripMembers.find(
        (m) => m.tripId === tripId && m.userId === currentUserId,
      ),
    [data.tripMembers, currentUserId],
  );

  const canEditTrip = useCallback(
    (tripId: string) => {
      const m = currentMembership(tripId);
      return Boolean(m && (m.role === "organizer" || m.canEdit));
    },
    [currentMembership],
  );

  const isOrganizer = useCallback(
    (tripId: string) => currentMembership(tripId)?.role === "organizer",
    [currentMembership],
  );

  const setMemberCanEdit = useCallback((memberId: string, canEdit: boolean) => {
    setData((prev) => ({
      ...prev,
      tripMembers: prev.tripMembers.map((m) =>
        m.id === memberId && m.role !== "organizer" ? { ...m, canEdit } : m,
      ),
    }));
  }, []);

  const value: StoreValue = {
    currentUser,
    users: data.users,
    authReady,
    requestOtp,
    verifyOtp,
    completeRegistration,
    signOut,
    visibleTrips,
    getTrip,
    canAccessTrip,
    getMembers,
    getDays,
    addActivity,
    addComment,
    canEditTrip,
    isOrganizer,
    setMemberCanEdit,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return ctx;
}
