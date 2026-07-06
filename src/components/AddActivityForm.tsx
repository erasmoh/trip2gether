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
        className="w-full rounded-xl border border-dashed border-slate-300 py-3 text-sm font-medium text-slate-500 transition hover:border-sky-400 hover:text-sky-600"
      >
        + Agregar actividad
      </button>
    );
  }

  const field =
    "rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400";

  return (
    <form
      onSubmit={submit}
      className="space-y-3 rounded-xl border border-sky-200 bg-sky-50/50 p-4"
    >
      <div className="flex flex-wrap gap-3">
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
          Inicio
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className={field}
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
          Fin (opcional)
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className={field}
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-xs font-medium text-slate-500">
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

      <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
        Ubicación (opcional)
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Ej. Centro histórico"
          className={field}
        />
      </label>

      <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
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
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!title.trim()}
          className="rounded-lg bg-sky-500 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-sky-600 disabled:opacity-40"
        >
          Guardar
        </button>
      </div>
    </form>
  );
}
