"use client";

import { useState } from "react";
import { updateTripDescription } from "@/lib/supabase/queries";

/** Inline-editable trip description. Read-only members just see the text
 * (or nothing, if it's still empty) — only editors get the edit affordance. */
export function TripDescription({
  tripId,
  description,
  canEdit,
  onUpdated,
}: {
  tripId: string;
  description: string;
  canEdit: boolean;
  onUpdated: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(description);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEdit() {
    setDraft(description);
    setError(null);
    setEditing(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updateTripDescription(tripId, draft.trim());
      onUpdated();
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar la descripción.");
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <form onSubmit={save} className="mt-4 max-w-2xl space-y-2">
        <textarea
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          placeholder="¿De qué se trata este viaje?"
          className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-clay focus:ring-1 focus:ring-clay"
        />
        {error && (
          <p className="border-l-2 border-clay bg-clay-soft/60 px-3 py-2 text-xs text-ink-soft">
            {error}
          </p>
        )}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-clay px-4 py-1.5 text-sm font-medium text-white transition hover:bg-clay/90 disabled:opacity-40"
          >
            {saving ? "Guardando…" : "Guardar"}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted transition hover:text-ink"
          >
            Cancelar
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="mt-4 max-w-2xl">
      {description ? (
        <p className="text-[15px] leading-relaxed text-ink-soft">{description}</p>
      ) : canEdit ? (
        <p className="text-sm text-muted">Sin descripción todavía.</p>
      ) : null}
      {canEdit && (
        <button
          type="button"
          onClick={startEdit}
          className="eyebrow mt-1.5 text-clay transition hover:opacity-70"
        >
          {description ? "Editar descripción" : "+ Agregar descripción"}
        </button>
      )}
    </div>
  );
}
