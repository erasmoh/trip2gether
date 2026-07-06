// Domain types for Trip Together.
// These mirror the planned Supabase schema (see supabase/schema.sql) so that
// swapping the in-memory mock store for real Supabase queries is a drop-in change.

export type MemberRole = "organizer" | "traveler";
export type InviteStatus = "pending" | "accepted" | "declined";

export interface User {
  id: string;
  fullName: string;
  email: string;
  avatarColor: string; // used for avatar fallback in the UI
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  description: string;
  startDate: string; // ISO date (YYYY-MM-DD)
  endDate: string; // ISO date (YYYY-MM-DD)
  coverColor: string;
  createdBy: string; // User.id
}

export interface TripMember {
  id: string;
  tripId: string;
  userId: string;
  role: MemberRole;
  status: InviteStatus;
  // Whether the member can create/edit itinerary content. Organizers always
  // can; travelers only if granted this privilege.
  canEdit: boolean;
}

export interface Activity {
  id: string;
  tripId: string;
  dayDate: string; // ISO date (YYYY-MM-DD) — the day this activity belongs to
  startTime: string; // "HH:MM"
  endTime?: string; // "HH:MM"
  title: string;
  location?: string;
  description: string;
  createdBy: string; // User.id
}

export interface Comment {
  id: string;
  activityId: string;
  userId: string;
  body: string;
  createdAt: string; // ISO datetime
}

// Convenience shapes used by the UI after joining the raw tables above.
export interface MemberWithUser extends TripMember {
  user: User;
}

export interface CommentWithUser extends Comment {
  user: User;
}

export interface ActivityWithComments extends Activity {
  comments: CommentWithUser[];
}

export interface TripDay {
  date: string; // ISO date
  activities: ActivityWithComments[];
}
