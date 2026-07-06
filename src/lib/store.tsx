"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
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

interface StoreValue {
  currentUser: User;
  users: User[];
  setCurrentUser: (userId: string) => void;
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
  const [currentUserId, setCurrentUserId] = useState<string>(seedData.users[0].id);

  const usersById = useMemo(() => {
    const map = new Map<string, User>();
    data.users.forEach((u) => map.set(u.id, u));
    return map;
  }, [data.users]);

  const currentUser = usersById.get(currentUserId) ?? data.users[0];

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
    setCurrentUser: setCurrentUserId,
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
