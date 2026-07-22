-- ---------------------------------------------------------------------------
-- Grant base table privileges to the PostgREST roles.
--
-- `auto_expose_new_tables` is unset in supabase/config.toml (the new default
-- for this CLI version), so tables created in `public` are no longer
-- auto-exposed to `anon`/`authenticated`/`service_role` — only structural
-- privileges (REFERENCES, TRIGGER, TRUNCATE) are granted automatically, none
-- of which let PostgREST actually read or write rows. Without this, every
-- request from the app fails with "permission denied for table ...",
-- regardless of the RLS policies in the initial migration.
--
-- Row Level Security (already enabled per-table) remains the real
-- authorization layer — these grants only let the roles reach the tables at
-- all; RLS policies still decide which rows/operations are allowed. `anon`
-- is intentionally excluded: every policy in this schema requires
-- `auth.role() = 'authenticated'` or a specific `auth.uid()` match, so
-- unauthenticated requests have no legitimate access to any of these tables.
-- ---------------------------------------------------------------------------

grant select, insert, update, delete on public.profiles      to authenticated, service_role;
grant select, insert, update, delete on public.trips         to authenticated, service_role;
grant select, insert, update, delete on public.trip_members  to authenticated, service_role;
grant select, insert, update, delete on public.activities    to authenticated, service_role;
grant select, insert, update, delete on public.comments      to authenticated, service_role;
