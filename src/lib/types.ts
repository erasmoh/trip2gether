// Domain types for Trip Together.
// These mirror the planned Supabase schema (see supabase/schema.sql) so that
// swapping the in-memory mock store for real Supabase queries is a drop-in change.

export type MemberRole = "organizer" | "traveler";
export type InviteStatus = "pending" | "accepted" | "declined";

export type UserPlan = "free" | "paid";

export interface User {
  id: string;
  fullName: string;
  email: string;
  avatarColor: string; // used for avatar fallback in the UI
  // Invited people exist as users but haven't completed passwordless
  // registration yet. First successful OTP verify flips this to true.
  registered: boolean;
  // Subscription tier. Paid accounts unlock premium features such as
  // claiming a custom short URL (slug) for a trip.
  plan: UserPlan;
}

export interface Trip {
  id: string; // UUID — used in the URL by default (/trips/<uuid>)
  // Optional custom short URL (/trips/<slug>). Unique across all trips;
  // claimable only by paid members with edit rights, and only if not taken.
  slug?: string;
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
  startTime?: string; // "HH:MM" — optional; quick-added activities have no time yet
  endTime?: string; // "HH:MM"
  title: string;
  location?: string;
  description?: string;
  createdBy: string; // User.id
  // Manual display order within its day (lower first). Drag-and-drop is the
  // only thing that changes this after creation — time is just a label.
  sortOrder: number;
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
  // Members who have confirmed they're on board with this activity.
  confirmedBy: User[];
}

export interface TripDay {
  date: string; // ISO date
  activities: ActivityWithComments[];
}
