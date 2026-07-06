"use client";

import Link from "next/link";
import { use, useState } from "react";
import { useStore } from "@/lib/store";
import { ActivityCard } from "@/components/ActivityCard";
import { AddActivityForm } from "@/components/AddActivityForm";
import { MembersPanel } from "@/components/MembersPanel";
import { formatDateRange, formatDayLabel } from "@/lib/format";
import { useRequireAuth } from "@/lib/useRequireAuth";

export default function TripPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = use(params);
  const { user } = useRequireAuth();
  const { getTrip, canAccessTrip, canEditTrip, getDays } = useStore();
  const trip = getTrip(tripId);
  const hasAccess = canAccessTrip(tripId);
  const days = getDays(tripId);
  const [activeDate, setActiveDate] = useState<string | null>(
    days[0]?.date ?? trip?.startDate ?? null,
  );

  if (!user) {
    return <p className="py-16 text-center text-slate-400">Cargando…</p>;
  }

  if (!trip) {
    return <NotFound message="Este viaje no existe." />;
  }

  if (!hasAccess) {
    return (
      <NotFound message="No tienes acceso a este viaje. Solo las personas invitadas pueden verlo." />
    );
  }

  const canEdit = canEditTrip(tripId);
  const selectedDate = activeDate ?? days[0]?.date ?? trip.startDate;
  const activeDay = days.find((d) => d.date === selectedDate);

  // Build the tab list from the trip's date range so empty days still show.
  const dateTabs = buildDateRange(trip.startDate, trip.endDate);

  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
      >
        ← Todos mis viajes
      </Link>

      <header
        className="overflow-hidden rounded-2xl text-white"
        style={{ backgroundColor: trip.coverColor }}
      >
        <div className="bg-black/10 p-6 sm:p-8">
          <h1 className="text-2xl font-bold sm:text-3xl">{trip.name}</h1>
          <p className="mt-1 text-white/90">{trip.destination}</p>
          <p className="mt-2 text-sm text-white/80">
            {formatDateRange(trip.startDate, trip.endDate)}
          </p>
          <p className="mt-3 max-w-2xl text-sm text-white/90">
            {trip.description}
          </p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
        <section className="space-y-4">
          {!canEdit && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              Tienes acceso de solo lectura. Pídele al organizador permisos de
              edición para modificar la agenda.
            </div>
          )}

          {/* Day tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {dateTabs.map((date, i) => (
              <button
                key={date}
                type="button"
                onClick={() => setActiveDate(date)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  date === selectedDate
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                }`}
              >
                <span className="mr-1 opacity-60">Día {i + 1}</span>
                {formatDayLabel(date)}
              </button>
            ))}
          </div>

          {/* Activities for the selected day */}
          <div className="space-y-3">
            {activeDay && activeDay.activities.length > 0 ? (
              activeDay.activities.map((a) => (
                <ActivityCard key={a.id} activity={a} />
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-400">
                Sin actividades para este día todavía.
              </p>
            )}

            {canEdit && (
              <AddActivityForm tripId={tripId} dayDate={selectedDate} />
            )}
          </div>
        </section>

        <MembersPanel tripId={tripId} />
      </div>
    </div>
  );
}

function NotFound({ message }: { message: string }) {
  return (
    <div className="space-y-4 py-16 text-center">
      <p className="text-4xl">🔒</p>
      <p className="mx-auto max-w-md text-slate-500">{message}</p>
      <Link
        href="/"
        className="inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
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
