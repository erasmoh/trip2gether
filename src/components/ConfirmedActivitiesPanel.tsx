"use client";

import { isFullyConfirmed } from "@/lib/supabase/queries";
import { formatDayLabel } from "@/lib/format";
import type { TripDay } from "@/lib/types";

/** Flat, cross-day list of activities every current trip member has confirmed. */
export function ConfirmedActivitiesPanel({
  days,
  memberIds,
  onSelectDay,
}: {
  days: TripDay[];
  memberIds: string[];
  onSelectDay: (date: string) => void;
}) {
  const confirmed = days.flatMap((day) =>
    day.activities
      .filter((a) => isFullyConfirmed(a, memberIds))
      .map((a) => ({ id: a.id, title: a.title, date: day.date })),
  );

  return (
    <aside className="h-fit rounded-lg border border-line bg-paper-raised p-5">
      <div className="flex items-baseline justify-between border-b border-line pb-2">
        <h3 className="eyebrow text-muted">Confirmadas</h3>
        <span className="font-display text-base text-ink">
          {String(confirmed.length).padStart(2, "0")}
        </span>
      </div>

      {confirmed.length === 0 ? (
        <p className="mt-3 text-xs leading-relaxed text-muted">
          Cuando todos los participantes confirmen una actividad, aparece aquí.
        </p>
      ) : (
        <ul className="mt-4 space-y-1">
          {confirmed.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => onSelectDay(a.date)}
                className="block w-full rounded-lg px-2 py-1.5 text-left transition hover:bg-paper"
              >
                <span className="block truncate text-sm font-medium text-ink">
                  {a.title}
                </span>
                <span className="eyebrow text-muted">{formatDayLabel(a.date)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
