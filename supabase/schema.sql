-- ---------------------------------------------------------------------------
-- Trip2gether — planned Supabase schema (NOT yet connected).
--
-- The frontend currently runs on an in-memory mock store (src/lib/mock-data.ts
-- + src/lib/store.tsx) whose shapes mirror these tables. When Supabase is wired
-- in, the store's selectors/mutations map 1:1 to queries against these tables.
--
-- Access control is enforced with Row Level Security: a row is only visible to
-- users who are members of the corresponding trip. Editing itinerary content
-- additionally requires organizer role OR the `can_edit` privilege.
-- ---------------------------------------------------------------------------

create extension if not exists "pgcrypto";

-- Profiles mirror auth.users (Supabase Auth) with app-specific fields.
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  full_name     text not null,
  email         text not null unique,
  avatar_color  text not null default '#64748b',
  created_at    timestamptz not null default now()
);

create table if not exists public.trips (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  destination  text not null,
  description  text not null default '',
  start_date   date not null,
  end_date     date not null,
  cover_color  text not null default '#0ea5e9',
  created_by   uuid not null references public.profiles (id),
  created_at   timestamptz not null default now()
);

create type member_role as enum ('organizer', 'traveler');
create type invite_status as enum ('pending', 'accepted', 'declined');

create table if not exists public.trip_members (
  id        uuid primary key default gen_random_uuid(),
  trip_id   uuid not null references public.trips (id) on delete cascade,
  user_id   uuid not null references public.profiles (id) on delete cascade,
  role      member_role not null default 'traveler',
  status    invite_status not null default 'pending',
  can_edit  boolean not null default false,
  unique (trip_id, user_id)
);

create table if not exists public.activities (
  id           uuid primary key default gen_random_uuid(),
  trip_id      uuid not null references public.trips (id) on delete cascade,
  day_date     date not null,
  start_time   time not null,
  end_time     time,
  title        text not null,
  location     text,
  description  text not null default '',
  created_by   uuid not null references public.profiles (id),
  created_at   timestamptz not null default now()
);

create table if not exists public.comments (
  id           uuid primary key default gen_random_uuid(),
  activity_id  uuid not null references public.activities (id) on delete cascade,
  user_id      uuid not null references public.profiles (id) on delete cascade,
  body         text not null,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Helper functions (SECURITY DEFINER to avoid recursive RLS evaluation).
-- ---------------------------------------------------------------------------
create or replace function public.is_trip_member(_trip_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.trip_members m
    where m.trip_id = _trip_id and m.user_id = auth.uid()
  );
$$;

create or replace function public.can_edit_trip(_trip_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.trip_members m
    where m.trip_id = _trip_id
      and m.user_id = auth.uid()
      and (m.role = 'organizer' or m.can_edit)
  );
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles      enable row level security;
alter table public.trips         enable row level security;
alter table public.trip_members  enable row level security;
alter table public.activities    enable row level security;
alter table public.comments      enable row level security;

-- Profiles: anyone authenticated can read (needed to render member names).
create policy "profiles_read" on public.profiles
  for select using (auth.role() = 'authenticated');
create policy "profiles_update_self" on public.profiles
  for update using (id = auth.uid());

-- Trips: only members can see a trip; only the organizer can update it.
create policy "trips_select_members" on public.trips
  for select using (public.is_trip_member(id));
create policy "trips_insert_own" on public.trips
  for insert with check (created_by = auth.uid());
create policy "trips_update_editors" on public.trips
  for update using (public.can_edit_trip(id));

-- Trip members: visible to fellow members; only organizers manage privileges.
create policy "members_select" on public.trip_members
  for select using (public.is_trip_member(trip_id));
create policy "members_manage_by_organizer" on public.trip_members
  for all using (
    exists (
      select 1 from public.trip_members o
      where o.trip_id = trip_members.trip_id
        and o.user_id = auth.uid()
        and o.role = 'organizer'
    )
  );

-- Activities: members read; editors create/update/delete.
create policy "activities_select" on public.activities
  for select using (public.is_trip_member(trip_id));
create policy "activities_write" on public.activities
  for all using (public.can_edit_trip(trip_id))
  with check (public.can_edit_trip(trip_id));

-- Comments: any member can read and post; authors can edit/delete their own.
create policy "comments_select" on public.comments
  for select using (
    public.is_trip_member((select trip_id from public.activities a where a.id = activity_id))
  );
create policy "comments_insert" on public.comments
  for insert with check (
    user_id = auth.uid()
    and public.is_trip_member((select trip_id from public.activities a where a.id = activity_id))
  );
create policy "comments_modify_own" on public.comments
  for update using (user_id = auth.uid());
create policy "comments_delete_own" on public.comments
  for delete using (user_id = auth.uid());
