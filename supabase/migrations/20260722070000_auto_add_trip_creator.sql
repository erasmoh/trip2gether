-- ---------------------------------------------------------------------------
-- Auto-add the creator of a trip as its organizer.
--
-- trips_insert_own only lets a user insert a trip with created_by = self;
-- nothing was adding the matching trip_members row, so a brand new trip was
-- immediately invisible even to the person who just created it (RLS's
-- trips_select_members requires trip membership, and there is no UI path
-- that creates that first membership otherwise). Mirrors the
-- handle_new_user pattern already used for auth.users -> profiles.
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_trip()
returns trigger language plpgsql security definer as $$
begin
  insert into public.trip_members (trip_id, user_id, role, status, can_edit)
  values (new.id, new.created_by, 'organizer', 'accepted', true)
  on conflict (trip_id, user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_trip_created on public.trips;
create trigger on_trip_created
  after insert on public.trips
  for each row execute function public.handle_new_trip();
