"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { Avatar } from "@/components/Avatar";
import { formatDateRange, tripLengthDays } from "@/lib/format";

export default function HomePage() {
  const { user } = useRequireAuth();
  const { visibleTrips, getMembers } = useStore();

  if (!user) {
    return <p className="py-16 text-center text-slate-400">Cargando…</p>;
  }
  const currentUser = user;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 p-6 text-white sm:p-8">
        <h1 className="text-2xl font-bold sm:text-3xl">
          Hola, {currentUser.fullName.split(" ")[0]} 👋
        </h1>
        <p className="mt-1 max-w-xl text-sky-50">
          Estos son tus viajes. Solo ves los planes a los que te han invitado.
          Abre uno para coordinar la agenda día a día con tu grupo.
        </p>
      </section>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">
          Mis viajes ({visibleTrips.length})
        </h2>
      </div>

      {visibleTrips.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          No estás en ningún viaje todavía. Cambia de usuario arriba para ver
          otros planes 😉
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {visibleTrips.map((trip) => {
            const members = getMembers(trip.id);
            return (
              <li key={trip.id}>
                <Link
                  href={`/trips/${trip.id}`}
                  className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div
                    className="h-24 w-full"
                    style={{ backgroundColor: trip.coverColor }}
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-900 group-hover:text-sky-600">
                      {trip.name}
                    </h3>
                    <p className="text-sm text-slate-500">{trip.destination}</p>
                    <p className="mt-2 text-xs font-medium text-slate-400">
                      {formatDateRange(trip.startDate, trip.endDate)} ·{" "}
                      {tripLengthDays(trip.startDate, trip.endDate)} días
                    </p>
                    <div className="mt-3 flex -space-x-2">
                      {members.slice(0, 5).map((m) => (
                        <span
                          key={m.id}
                          className="rounded-full ring-2 ring-white"
                        >
                          <Avatar user={m.user} size="sm" />
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
