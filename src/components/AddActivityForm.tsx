"use client";

import { useState } from "react";
import { insertActivity } from "@/lib/supabase/queries";
import { formatDayLabel } from "@/lib/format";

const field =
  "rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-clay focus:ring-1 focus:ring-clay";

/**
 * Global floating CTA to add an activity from anywhere in the trip page.
 * The target day is taken from the currently selected day tab; time is
 * optional so quick-added activities can still skip it.
 */
export function AddActivityForm({
  tripId,
  dayDate,
  createdBy,
  onAdded,
}: {
  tripId: string;
  dayDate: string;
  createdBy: string;
  onAdded: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function close() {
    setTitle("");
    setStartTime("");
    setEndTime("");
    setError(null);
    setOpen(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    if (startTime && endTime && endTime < startTime) {
      setError("La hora de fin no puede ser antes que la de inicio.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await insertActivity(tripId, createdBy, {
        dayDate,
        title: title.trim(),
        startTime: startTime || undefined,
        endTime: endTime || undefined,
      });
      onAdded();
      close();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo agregar la actividad.");
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 rounded-full bg-clay px-5 py-3 text-sm font-medium text-white shadow-lg transition hover:bg-clay/90"
      >
        + Agregar actividad
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
          onClick={close}
        >
          <form
            role="dialog"
            aria-modal="true"
            aria-label="Nueva actividad"
            onSubmit={submit}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.key === "Escape" && close()}
            className="w-full max-w-sm space-y-4 rounded-lg border border-line bg-paper-raised p-5 shadow-xl"
          >
            <div>
              <p className="eyebrow text-clay">Nueva actividad</p>
              <p className="mt-1 text-xs text-muted">
                Se agregará al día {formatDayLabel(dayDate)}.
              </p>
            </div>

            <label className="flex flex-col gap-1 eyebrow text-muted">
              Título
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Visita al museo"
                className={field}
                required
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1 eyebrow text-muted">
                Hora inicio (opcional)
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className={field}
                />
              </label>
              <label className="flex flex-col gap-1 eyebrow text-muted">
                Hora fin (opcional)
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className={field}
                />
              </label>
            </div>

            {error && (
              <p className="border-l-2 border-clay bg-clay-soft/60 px-3 py-2 text-xs text-ink-soft">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={close}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted transition hover:text-ink"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!title.trim() || submitting}
                className="rounded-lg bg-clay px-4 py-1.5 text-sm font-medium text-white transition hover:bg-clay/90 disabled:opacity-40"
              >
                {submitting ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
