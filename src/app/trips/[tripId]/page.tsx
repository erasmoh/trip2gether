"use client";

import Link from "next/link";
import { use, useState } from "react";
import { useTrip, useDays, useMembers, useMembership } from "@/lib/hooks";
import { canEditFromMembership } from "@/lib/supabase/queries";
import { ActivityCard } from "@/components/ActivityCard";
import { AddActivityForm } from "@/components/AddActivityForm";
import { ConfirmedActivitiesPanel } from "@/components/ConfirmedActivitiesPanel";
import { MembersPanel } from "@/components/MembersPanel";
import { TripLinkPanel } from "@/components/TripLinkPanel";
import { formatDateRange, formatDayLabel } from "@/lib/format";
import { useRequireAuth } from "@/lib/useRequireAuth";

export default function TripPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  // The segment accepts the trip UUID or its custom short slug.
  const { tripId: tripRef } = use(params);
  const { user } = useRequireAuth();
  const { trip, loading: tripLoading } = useTrip(tripRef);
  const { membership, loading: membershipLoading } = useMembership(
    trip?.id ?? null,
    user?.id ?? null,
  );
  const { days, refetch: refetchDays } = useDays(trip?.id ?? null);
  const { members } = useMembers(trip?.id ?? null);
  const memberIds = members.map((m) => m.userId);
  const [activeDate, setActiveDate] = useState<string | null>(
    days[0]?.date ?? trip?.startDate ?? null,
  );

  if (!user || tripLoading || membershipLoading) {
    return <p className="py-16 text-center text-muted">Cargando…</p>;
  }

  if (!trip) {
    return <NotFound message="Este viaje no existe o no tienes acceso a él." />;
  }

  const canEdit = canEditFromMembership(membership);
  const selectedDate = activeDate ?? days[0]?.date ?? trip.startDate;
  const activeDay = days.find((d) => d.date === selectedDate);

  // Build the tab list from the trip's date range so empty days still show.
  const dateTabs = buildDateRange(trip.startDate, trip.endDate);

  return (
    <div className="space-y-8">
      <Link
        href="/trips"
        className="eyebrow inline-flex items-center gap-1.5 text-muted transition hover:text-ink"
      >
        ← Todos mis viajes
      </Link>

      <header className="border-b border-line pb-8">
        <div className="flex items-center gap-3">
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: trip.coverColor }}
          />
          <p className="eyebrow text-muted">{trip.destination}</p>
        </div>
        <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight text-ink sm:text-5xl">
          {trip.name}
        </h1>
        <p className="eyebrow mt-4 text-clay">
          {formatDateRange(trip.startDate, trip.endDate)}
        </p>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
          {trip.description}
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_18rem]">
        <section className="space-y-5">
          {!canEdit && (
            <div className="border-l-2 border-clay bg-clay-soft/60 px-4 py-2.5 text-xs text-ink-soft">
              Tienes acceso de solo lectura. Pídele al organizador permisos de
              edición para modificar la agenda.
            </div>
          )}

          {/* Day tabs — wrap onto extra lines instead of horizontal-scrolling
              once there are more than a handful of days. */}
          <div className="flex flex-wrap gap-1.5 border-b border-line pb-3">
            {dateTabs.map((date, i) => (
              <button
                key={date}
                type="button"
                onClick={() => setActiveDate(date)}
                className={`rounded-full border px-2.5 py-1 text-xs transition ${
                  date === selectedDate
                    ? "border-ink bg-ink text-paper"
                    : "border-line bg-paper-raised text-ink-soft hover:border-ink/30"
                }`}
              >
                <span className="mr-1 font-mono text-[10px] opacity-60">
                  D{i + 1}
                </span>
                {formatDayLabel(date)}
              </button>
            ))}
          </div>

          {/* Activities for the selected day */}
          <div className="space-y-3">
            {activeDay && activeDay.activities.length > 0 ? (
              activeDay.activities.map((a) => (
                <ActivityCard
                  key={a.id}
                  activity={a}
                  currentUserId={user.id}
                  memberIds={memberIds}
                  onCommentAdded={refetchDays}
                  onConfirmationChanged={refetchDays}
                />
              ))
            ) : (
              <p className="border border-dashed border-line bg-paper-raised p-6 text-center text-sm text-muted">
                Sin actividades para este día todavía.
              </p>
            )}
          </div>
        </section>

        <div className="space-y-5">
          <MembersPanel
            tripId={trip.id}
            currentUserId={user.id}
            canManage={membership?.role === "organizer"}
          />
          <ConfirmedActivitiesPanel
            days={days}
            memberIds={memberIds}
            onSelectDay={setActiveDate}
          />
          <TripLinkPanel
            trip={trip}
            currentUser={user}
            membership={membership}
            days={days}
          />
        </div>
      </div>

      {/* Global floating CTA: adds to the currently selected day tab. */}
      {canEdit && (
        <AddActivityForm
          tripId={trip.id}
          dayDate={selectedDate}
          createdBy={user.id}
          onAdded={refetchDays}
        />
      )}
    </div>
  );
}

function NotFound({ message }: { message: string }) {
  return (
    <div className="space-y-5 py-20 text-center">
      <p className="eyebrow text-clay">Acceso restringido</p>
      <p className="mx-auto max-w-md font-display text-2xl leading-snug text-ink">
        {message}
      </p>
      <Link
        href="/trips"
        className="inline-block border border-ink px-5 py-2 text-sm font-medium text-ink transition hover:bg-ink hover:text-paper"
      >
        Volver a mis viajes
      </Link>
    </div>
  );
}

function buildDateRange(startIso: string, endIso: string): string[] {
  const dates: string[] = [];
  const [sy, sm, sd] = startIso.split("-").map(Number);
  const [ey, em, ed] = endIso.split("-").map(Number);
  const cursor = new Date(sy, sm - 1, sd);
  const end = new Date(ey, em - 1, ed);
  while (cursor <= end) {
    const y = cursor.getFullYear();
    const m = String(cursor.getMonth() + 1).padStart(2, "0");
    const d = String(cursor.getDate()).padStart(2, "0");
    dates.push(`${y}-${m}-${d}`);
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}
