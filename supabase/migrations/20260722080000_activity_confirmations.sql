-- ---------------------------------------------------------------------------
-- Activity confirmations: any trip member can mark that they agree with /
-- are on board with a given activity. An activity is "confirmed" (for the
-- filtered "Confirmadas" list) once every current trip member has confirmed
-- it — this is computed client-side by comparing confirmedBy.length against
-- the trip's member count, so no extra column/trigger is needed here.
-- ---------------------------------------------------------------------------

create table if not exists public.activity_confirmations (
  id           uuid primary key default gen_random_uuid(),
  activity_id  uuid not null references public.activities (id) on delete cascade,
  user_id      uuid not null references public.profiles (id) on delete cascade,
  created_at   timestamptz not null default now(),
  unique (activity_id, user_id)
);

alter table public.activity_confirmations enable row level security;

-- Same visibility rule as comments: any member of the activity's trip.
create policy "confirmations_select" on public.activity_confirmations
  for select using (
    public.is_trip_member((select trip_id from public.activities a where a.id = activity_id))
  );

-- Members can only confirm as themselves, and only on trips they belong to.
create policy "confirmations_insert_own" on public.activity_confirmations
  for insert with check (
    user_id = auth.uid()
    and public.is_trip_member((select trip_id from public.activities a where a.id = activity_id))
  );

-- Un-confirming is just deleting your own row.
create policy "confirmations_delete_own" on public.activity_confirmations
  for delete using (user_id = auth.uid());

-- auto_expose_new_tables is off (see 20260722060000_grant_table_privileges.sql) —
-- new tables need explicit grants before PostgREST can reach them at all.
grant select, insert, delete on public.activity_confirmations to authenticated, service_role;
