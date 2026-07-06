"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";

export function AddActivityForm({
  tripId,
  dayDate,
}: {
  tripId: string;
  dayDate: string;
}) {
  const { addActivity } = useStore();
  const [open, setOpen] = useState(false);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  function reset() {
    setStartTime("09:00");
    setEndTime("");
    setTitle("");
    setLocation("");
    setDescription("");
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    addActivity(tripId, {
      dayDate,
      startTime,
      endTime: endTime || undefined,
      title: title.trim(),
      location: location.trim() || undefined,
      description: description.trim(),
    });
    reset();
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-lg border border-dashed border-line py-3 text-sm font-medium text-muted transition hover:border-clay hover:text-clay"
      >
        + Agregar actividad
      </button>
    );
  }

  const field =
    "rounded-lg border border-line bg-paper-raised px-3 py-1.5 text-sm text-ink outline-none focus:border-clay focus:ring-1 focus:ring-clay";
  const label = "flex flex-col gap-1 eyebrow text-muted";

  return (
    <form
      onSubmit={submit}
      className="space-y-3 rounded-lg border border-clay/30 bg-clay-soft/40 p-4"
    >
      <div className="flex flex-wrap gap-3">
        <label className={label}>
          Inicio
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className={field}
            required
          />
        </label>
        <label className={label}>
          Fin (opcional)
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className={field}
          />
        </label>
        <label className={`${label} flex-1`}>
          Título
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej. Visita al museo"
            className={field}
            required
          />
        </label>
      </div>

      <label className={label}>
        Ubicación (opcional)
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Ej. Centro histórico"
          className={field}
        />
      </label>

      <label className={label}>
        Descripción
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Detalles, notas, qué llevar…"
          className={field}
        />
      </label>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            reset();
            setOpen(false);
          }}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted transition hover:text-ink"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!title.trim()}
          className="rounded-lg bg-clay px-4 py-1.5 text-sm font-medium text-white transition hover:bg-clay/90 disabled:opacity-40"
        >
          Guardar
        </button>
      </div>
    </form>
  );
}
