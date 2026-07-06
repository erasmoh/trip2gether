"use client";

import { useStore } from "@/lib/store";
import { Avatar } from "./Avatar";

const STATUS_LABEL: Record<string, string> = {
  accepted: "Aceptó",
  pending: "Pendiente",
  declined: "Rechazó",
};

export function MembersPanel({ tripId }: { tripId: string }) {
  const { getMembers, currentUser, isOrganizer, setMemberCanEdit } = useStore();
  const members = getMembers(tripId);
  const canManage = isOrganizer(tripId);

  return (
    <aside className="h-fit rounded-lg border border-line bg-paper-raised p-5">
      <div className="flex items-baseline justify-between border-b border-line pb-2">
        <h3 className="eyebrow text-muted">Participantes</h3>
        <span className="font-display text-base text-ink">
          {String(members.length).padStart(2, "0")}
        </span>
      </div>
      {canManage && (
        <p className="mt-3 text-xs leading-relaxed text-muted">
          Como organizador, puedes dar o quitar permisos de edición.
        </p>
      )}

      <ul className="mt-4 space-y-4">
        {members.map((m) => {
          const isSelf = m.userId === currentUser?.id;
          const effectiveCanEdit = m.role === "organizer" || m.canEdit;
          return (
            <li key={m.id} className="flex items-center gap-3">
              <Avatar user={m.user} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">
                  {m.user.fullName}{" "}
                  {isSelf && <span className="text-muted">(tú)</span>}
                </p>
                <p className="flex items-center gap-1.5 text-xs text-muted">
                  <span
                    className={
                      m.role === "organizer" ? "font-medium text-moss" : ""
                    }
                  >
                    {m.role === "organizer" ? "Organizador" : "Viajero"}
                  </span>
                  <span>·</span>
                  <span>{STATUS_LABEL[m.status]}</span>
                </p>
              </div>

              {m.role === "organizer" ? (
                <span className="eyebrow text-moss">Edita</span>
              ) : canManage ? (
                <button
                  type="button"
                  onClick={() => setMemberCanEdit(m.id, !m.canEdit)}
                  role="switch"
                  aria-checked={m.canEdit}
                  aria-label={`Permiso de edición para ${m.user.fullName}`}
                  className={`relative h-5 w-9 shrink-0 rounded-full transition ${
                    m.canEdit ? "bg-clay" : "bg-line"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-paper-raised shadow-sm transition ${
                      m.canEdit ? "left-4" : "left-0.5"
                    }`}
                  />
                </button>
              ) : (
                <span
                  className={`eyebrow ${
                    effectiveCanEdit ? "text-clay" : "text-muted"
                  }`}
                >
                  {effectiveCanEdit ? "Edita" : "Solo lee"}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
