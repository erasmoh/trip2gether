// Thin data-access layer: every function maps snake_case rows from Postgres
// to the camelCase shapes in src/lib/types.ts, so the rest of the app (pages,
// components) keeps working against the same domain types regardless of
// where the data comes from. Access control is enforced by RLS (see
// supabase/migrations); these functions don't re-check permissions
// themselves, they just surface whatever Postgres allows for the current
// session.

import { supabase } from "./client";
import type { Tables } from "./database.types";
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
} from "@/lib/types";

type ProfileRow = Tables<"profiles">;
type TripRow = Tables<"trips">;
type MemberRow = Tables<"trip_members">;
type ActivityRow = Tables<"activities">;
type CommentRow = Tables<"comments">;

function mapProfile(row: ProfileRow): User {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    avatarColor: row.avatar_color,
    registered: row.registered,
    plan: row.plan === "paid" ? "paid" : "free",
  };
}

function mapTrip(row: TripRow): Trip {
  return {
    id: row.id,
    slug: row.slug ?? undefined,
    name: row.name,
    destination: row.destination,
    description: row.description,
    startDate: row.start_date,
    endDate: row.end_date,
    coverColor: row.cover_color,
    createdBy: row.created_by,
  };
}

function mapMember(row: MemberRow): TripMember {
  return {
    id: row.id,
    tripId: row.trip_id,
    userId: row.user_id,
    role: row.role,
    status: row.status,
    canEdit: row.can_edit,
  };
}

function mapActivity(row: ActivityRow): Activity {
  return {
    id: row.id,
    tripId: row.trip_id,
    dayDate: row.day_date,
    startTime: row.start_time?.slice(0, 5) ?? undefined,
    endTime: row.end_time?.slice(0, 5) ?? undefined,
    title: row.title,
    location: row.location ?? undefined,
    description: row.description,
    createdBy: row.created_by,
  };
}

function mapComment(row: CommentRow): Comment {
  return {
    id: row.id,
    activityId: row.activity_id,
    userId: row.user_id,
    body: row.body,
    createdAt: row.created_at,
  };
}

export async function fetchProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapProfile(data) : null;
}

export async function updateProfile(
  userId: string,
  patch: Partial<Pick<User, "fullName" | "registered">>,
): Promise<User> {
  const { data, error } = await supabase
    .from("profiles")
    .update({
      ...(patch.fullName !== undefined && { full_name: patch.fullName }),
      ...(patch.registered !== undefined && { registered: patch.registered }),
    })
    .eq("id", userId)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return mapProfile(data);
}

/** Trips visible to the current session — RLS already scopes this to trips the user is a member of. */
export async function fetchVisibleTrips(): Promise<Trip[]> {
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .order("start_date", { ascending: true });
  if (error) throw new Error(error.message);
  return data.map(mapTrip);
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Resolves a trip by UUID or by its custom slug. RLS hides trips the user can't access
 *  (returns null either way — we intentionally don't distinguish "doesn't exist" from
 *  "no access" to avoid leaking which trip ids exist). */
export async function fetchTrip(idOrSlug: string): Promise<Trip | null> {
  // `id` is a uuid column: comparing it against a non-uuid slug throws
  // "invalid input syntax for type uuid" instead of just not matching, so
  // only include that half of the filter when idOrSlug actually looks like one.
  const filter = UUID_RE.test(idOrSlug)
    ? `id.eq.${idOrSlug},slug.eq.${idOrSlug}`
    : `slug.eq.${idOrSlug}`;
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .or(filter)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapTrip(data) : null;
}

export async function fetchMembers(tripId: string): Promise<MemberWithUser[]> {
  const { data, error } = await supabase
    .from("trip_members")
    .select("*, user:profiles(*)")
    .eq("trip_id", tripId);
  if (error) throw new Error(error.message);
  return data
    .filter((r): r is typeof r & { user: ProfileRow } => r.user !== null)
    .map((r) => ({ ...mapMember(r), user: mapProfile(r.user) }));
}

/** This user's own membership row for a trip, or null if they aren't a member. */
export async function fetchMembership(
  tripId: string,
  userId: string,
): Promise<TripMember | null> {
  const { data, error } = await supabase
    .from("trip_members")
    .select("*")
    .eq("trip_id", tripId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapMember(data) : null;
}

export function canEditFromMembership(membership: TripMember | null): boolean {
  return Boolean(membership && (membership.role === "organizer" || membership.canEdit));
}

export async function setMemberCanEdit(memberId: string, canEdit: boolean): Promise<void> {
  const { error } = await supabase
    .from("trip_members")
    .update({ can_edit: canEdit })
    .eq("id", memberId);
  if (error) throw new Error(error.message);
}

/** Activities for a trip, grouped by day and with their comments attached (nested select). */
export async function fetchDays(tripId: string): Promise<TripDay[]> {
  const { data, error } = await supabase
    .from("activities")
    .select("*, comments(*, user:profiles(*))")
    .eq("trip_id", tripId);
  if (error) throw new Error(error.message);

  const byDate = new Map<string, ActivityWithComments[]>();
  for (const row of data) {
    const comments: CommentWithUser[] = row.comments
      .filter((c): c is typeof c & { user: ProfileRow } => c.user !== null)
      .map((c) => ({ ...mapComment(c), user: mapProfile(c.user) }))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

    const activity: ActivityWithComments = { ...mapActivity(row), comments };
    const bucket = byDate.get(activity.dayDate) ?? [];
    bucket.push(activity);
    byDate.set(activity.dayDate, bucket);
  }

  return Array.from(byDate.entries())
    .map(([date, activities]) => ({
      date,
      // Timed activities first (chronological); untimed ones keep insertion order at the end.
      activities: activities.sort((a, b) => {
        if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime);
        if (a.startTime) return -1;
        if (b.startTime) return 1;
        return 0;
      }),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export interface NewActivityInput {
  dayDate: string;
  title: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  description?: string;
}

export async function insertActivity(
  tripId: string,
  createdBy: string,
  input: NewActivityInput,
): Promise<Activity> {
  const { data, error } = await supabase
    .from("activities")
    .insert({
      trip_id: tripId,
      created_by: createdBy,
      day_date: input.dayDate,
      title: input.title,
      start_time: input.startTime,
      end_time: input.endTime,
      location: input.location,
      description: input.description,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return mapActivity(data);
}

export async function insertComment(
  activityId: string,
  userId: string,
  body: string,
): Promise<Comment> {
  const { data, error } = await supabase
    .from("comments")
    .insert({ activity_id: activityId, user_id: userId, body })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return mapComment(data);
}

export interface SetSlugResult {
  ok: boolean;
  error?: string;
  path?: string;
}

/** Claim/clear a custom short URL for a trip. RLS + the trips_slug_guard trigger enforce the
 *  actual "paid plan with edit rights" rule server-side; the checks here just produce a
 *  friendlier error message before hitting the database. */
export async function setTripSlug(
  trip: Trip,
  currentUser: User,
  membership: TripMember | null,
  rawSlug: string,
): Promise<SetSlugResult> {
  if (!canEditFromMembership(membership)) {
    return { ok: false, error: "Necesitas permisos de edición en este viaje." };
  }
  if (currentUser.plan !== "paid") {
    return { ok: false, error: "La URL personalizada es una función de cuentas de pago." };
  }
  const slug = rawSlug.trim().toLowerCase();
  const nextSlug = slug === "" ? null : slug;
  if (nextSlug !== null) {
    const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (slug.length < 3 || slug.length > 30 || !SLUG_RE.test(slug)) {
      return { ok: false, error: "Usa 3–30 caracteres: minúsculas, números y guiones." };
    }
  }

  const { error } = await supabase.from("trips").update({ slug: nextSlug }).eq("id", trip.id);
  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Esa URL ya está en uso. Prueba con otra." };
    }
    return { ok: false, error: error.message };
  }
  return { ok: true, path: `/trips/${nextSlug ?? trip.id}` };
}
