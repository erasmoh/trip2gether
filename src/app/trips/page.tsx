"use client";

import Link from "next/link";
import { useVisibleTrips, useMembers } from "@/lib/hooks";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { Avatar } from "@/components/Avatar";
import { formatDateRange, tripLengthDays, tripPath } from "@/lib/format";
import type { Trip } from "@/lib/types";

export default function TripsPage() {
  const { user } = useRequireAuth();
  const { trips, loading, error } = useVisibleTrips();

  if (!user) {
    return <p className="py-16 text-center text-muted">Cargando…</p>;
  }
  const currentUser = user;

  return (
    <div className="space-y-10">
      <section className="border-b border-line pb-8">
        <p className="eyebrow text-clay">Buen viaje, {currentUser.fullName.split(" ")[0]}</p>
        <h1 className="mt-3 max-w-2xl font-display text-4xl leading-[1.05] tracking-tight text-ink sm:text-5xl">
          Tus planes, en un solo{" "}
          <span className="italic text-clay">itinerario</span>.
        </h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-soft">
          Solo ves los viajes a los que te han invitado. Abre uno para coordinar
          la agenda día a día con tu grupo.
        </p>
      </section>

      <div className="flex items-baseline justify-between border-b border-line pb-2">
        <h2 className="eyebrow text-muted">Mis viajes</h2>
        <span className="font-display text-lg text-ink">
          {String(trips.length).padStart(2, "0")}
        </span>
      </div>

      {error && (
        <p className="border-l-2 border-clay bg-clay-soft/60 px-3 py-2 text-sm text-ink-soft">
          {error}
        </p>
      )}

      {loading ? (
        <p className="py-10 text-center text-sm text-muted">Cargando viajes…</p>
      ) : trips.length === 0 ? (
        <div className="border border-dashed border-line bg-paper-raised p-10 text-center text-sm text-muted">
          No estás en ningún viaje todavía.
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2">
          {trips.map((trip) => (
            <TripListItem key={trip.id} trip={trip} />
          ))}
        </ul>
      )}
    </div>
  );
}

function TripListItem({ trip }: { trip: Trip }) {
  const { members } = useMembers(trip.id);

  return (
    <li>
      <Link
        href={tripPath(trip)}
        className="group block overflow-hidden rounded-lg border border-line bg-paper-raised transition duration-200 hover:-translate-y-1 hover:border-ink/25 hover:shadow-[0_18px_40px_-20px_rgba(25,20,16,0.35)]"
      >
        <div
          className="relative h-28 w-full"
          style={{ backgroundColor: trip.coverColor }}
        >
          <span className="eyebrow absolute bottom-3 left-4 text-white/90 mix-blend-plus-lighter">
            {tripLengthDays(trip.startDate, trip.endDate)} días
          </span>
        </div>
        <div className="p-5">
          <h3 className="font-display text-xl leading-tight tracking-tight text-ink">
            {trip.name}
          </h3>
          <p className="mt-1 text-sm text-ink-soft">
            {trip.destination}
          </p>
          <p className="eyebrow mt-3 text-muted">
            {formatDateRange(trip.startDate, trip.endDate)}
          </p>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex -space-x-2">
              {members.slice(0, 5).map((m) => (
                <span
                  key={m.id}
                  className="rounded-full ring-2 ring-paper-raised"
                >
                  <Avatar user={m.user} size="sm" />
                </span>
              ))}
            </div>
            <span className="font-display text-lg text-clay opacity-0 transition group-hover:opacity-100">
              →
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
}
