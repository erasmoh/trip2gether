"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Trip, TripDay, TripMember, User } from "@/lib/types";
import { canEditFromMembership, setTripSlug } from "@/lib/supabase/queries";
import { buildTripSummary, tripPath } from "@/lib/format";

/**
 * Sharing hub: copy the trip URL, send the full itinerary summary via
 * WhatsApp, and (for paid members with edit rights) claim a custom short URL.
 */
export function TripLinkPanel({
  trip,
  currentUser,
  membership,
  days,
}: {
  trip: Trip;
  currentUser: User;
  membership: TripMember | null;
  days: TripDay[];
}) {
  const router = useRouter();
  const [draft, setDraft] = useState(trip.slug ?? "");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  const path = tripPath(trip);
  const canCustomize = canEditFromMembership(membership);
  const isPaid = currentUser.plan === "paid";
  const unchanged = draft.trim().toLowerCase() === (trip.slug ?? "");

  function copy() {
    navigator.clipboard?.writeText(`${window.location.origin}${path}`).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      },
      () => {},
    );
  }

  // Opens WhatsApp with the full itinerary as text + the trip link at the end.
  function shareOnWhatsApp() {
    const summary = buildTripSummary(
      trip,
      days,
      `${window.location.origin}${path}`,
    );
    window.open(
      `https://wa.me/?text=${encodeURIComponent(summary)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const res = await setTripSlug(trip, currentUser, membership, draft);
    setSaving(false);
    if (!res.ok) {
      setError(res.error ?? "No se pudo guardar la URL.");
      return;
    }
    // Keep the address bar in sync with the new canonical URL.
    if (res.path) router.replace(res.path);
  }

  return (
    <aside className="h-fit rounded-lg border border-line bg-paper-raised p-5">
      <h3 className="eyebrow border-b border-line pb-2 text-muted">
        Compartir
      </h3>

      <div className="mt-4 flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-md border border-line bg-paper px-2 py-1.5 font-mono text-[11px] text-ink-soft">
          {path}
        </code>
        <button
          type="button"
          onClick={copy}
          className="shrink-0 rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-ink-soft transition hover:border-clay hover:text-clay"
        >
          {copied ? "Copiado" : "Copiar"}
        </button>
      </div>

      <button
        type="button"
        onClick={shareOnWhatsApp}
        className="mt-2 w-full rounded-lg bg-moss px-3 py-2 text-xs font-bold text-white transition hover:bg-moss/90"
      >
        Enviar itinerario por WhatsApp
      </button>
      <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
        Comparte el resumen día a día con el enlace al viaje al final.
      </p>

      {canCustomize &&
        (isPaid ? (
          <form onSubmit={save} className="mt-4 space-y-2 border-t border-line pt-4">
            <label className="flex flex-col gap-1 eyebrow text-muted">
              URL corta personalizada
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="ej. japon-2026"
                className="rounded-lg border border-line bg-paper px-3 py-1.5 font-mono text-xs text-ink outline-none focus:border-clay focus:ring-1 focus:ring-clay"
              />
            </label>
            <p className="text-[11px] leading-relaxed text-muted">
              3–30 caracteres: minúsculas, números y guiones. Déjala vacía para
              volver al enlace original.
            </p>
            {error && (
              <p className="border-l-2 border-clay bg-clay-soft/60 px-3 py-2 text-xs text-ink-soft">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={unchanged || saving}
              className="w-full rounded-lg bg-clay px-3 py-1.5 text-xs font-medium text-white transition hover:bg-clay/90 disabled:opacity-40"
            >
              {saving ? "Guardando…" : "Guardar URL"}
            </button>
          </form>
        ) : (
          <p className="mt-4 border-t border-line pt-4 text-[11px] leading-relaxed text-muted">
            Personalizar la URL del viaje es una función de cuentas de pago.
          </p>
        ))}
    </aside>
  );
}
