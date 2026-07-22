-- ---------------------------------------------------------------------------
-- Manual drag-and-drop ordering for activities within a day.
--
-- Previously activities were ordered purely by start_time (untimed ones kept
-- whatever order Postgres happened to return, which isn't guaranteed without
-- an explicit ORDER BY). sort_order is now the single source of truth for
-- display order within a (trip_id, day_date) bucket: insertActivity() appends
-- new activities at the end, and reorderActivities() rewrites it after a
-- drag-and-drop. Time stays purely informational on the card.
-- ---------------------------------------------------------------------------

alter table public.activities add column if not exists sort_order integer not null default 0;

-- Backfill existing rows (if any) with the order they'd have sorted in
-- under the old start_time-first rule, so nothing visibly jumps around.
with ordered as (
  select id, row_number() over (
    partition by trip_id, day_date
    order by (start_time is null), start_time, created_at
  ) - 1 as rn
  from public.activities
)
update public.activities a
set sort_order = ordered.rn
from ordered
where ordered.id = a.id;
