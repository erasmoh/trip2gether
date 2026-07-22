"use client";

import { useState } from "react";
import { insertTrip } from "@/lib/supabase/queries";
import type { Trip } from "@/lib/types";

const field =
  "rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-clay focus:ring-1 focus:ring-clay";

/** "+ Nuevo viaje" button + modal. The creator becomes the trip's organizer
 * automatically (see the on_trip_created DB trigger), so it's immediately
 * visible in their trip list. */
export function CreateTripForm({
  createdBy,
  onCreated,
}: {
  createdBy: string;
  onCreated: (trip: Trip) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function close() {
    setName("");
    setDestination("");
    setStartDate("");
    setEndDate("");
    setDescription("");
    setError(null);
    setOpen(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !destination.trim() || !startDate || !endDate) return;
    if (endDate < startDate) {
      setError("La fecha de fin no puede ser antes que la de inicio.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const trip = await insertTrip(createdBy, {
        name: name.trim(),
        destination: destination.trim(),
        description: description.trim() || undefined,
        startDate,
        endDate,
      });
      onCreated(trip);
      close();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el viaje.");
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="shrink-0 rounded-full bg-ink px-4 py-1.5 text-sm font-bold text-paper transition hover:bg-ink/85"
      >
        + Nuevo viaje
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
          onClick={close}
        >
          <form
            role="dialog"
            aria-modal="true"
            aria-label="Nuevo viaje"
            onSubmit={submit}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.key === "Escape" && close()}
            className="w-full max-w-sm space-y-3 rounded-lg border border-line bg-paper-raised p-5 shadow-xl"
          >
            <p className="eyebrow text-clay">Nuevo viaje</p>

            <label className="flex flex-col gap-1 eyebrow text-muted">
              Nombre
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Aventura en Japón"
                className={field}
                required
              />
            </label>

            <label className="flex flex-col gap-1 eyebrow text-muted">
              Destino
              <input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Ej. Tokio, Japón"
                className={field}
                required
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1 eyebrow text-muted">
                Desde
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={field}
                  required
                />
              </label>
              <label className="flex flex-col gap-1 eyebrow text-muted">
                Hasta
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={field}
                  required
                />
              </label>
            </div>

            <label className="flex flex-col gap-1 eyebrow text-muted">
              Descripción (opcional)
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="¿De qué se trata este viaje?"
                rows={2}
                className={`${field} resize-none`}
              />
            </label>

            {error && (
              <p className="border-l-2 border-clay bg-clay-soft/60 px-3 py-2 text-xs text-ink-soft">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={close}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted transition hover:text-ink"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={
                  !name.trim() || !destination.trim() || !startDate || !endDate || submitting
                }
                className="rounded-lg bg-clay px-4 py-1.5 text-sm font-medium text-white transition hover:bg-clay/90 disabled:opacity-40"
              >
                {submitting ? "Creando…" : "Crear viaje"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
