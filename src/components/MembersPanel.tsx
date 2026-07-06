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
    <aside className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800">
          Participantes ({members.length})
        </h3>
      </div>
      {canManage && (
        <p className="mt-1 text-xs text-slate-400">
          Como organizador, puedes dar o quitar permisos de edición.
        </p>
      )}

      <ul className="mt-3 space-y-3">
        {members.map((m) => {
          const isSelf = m.userId === currentUser?.id;
          const effectiveCanEdit = m.role === "organizer" || m.canEdit;
          return (
            <li key={m.id} className="flex items-center gap-3">
              <Avatar user={m.user} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800">
                  {m.user.fullName} {isSelf && <span className="text-slate-400">(tú)</span>}
                </p>
                <p className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span
                    className={
                      m.role === "organizer"
                        ? "font-medium text-indigo-600"
                        : ""
                    }
                  >
                    {m.role === "organizer" ? "Organizador" : "Viajero"}
                  </span>
                  <span>·</span>
                  <span>{STATUS_LABEL[m.status]}</span>
                </p>
              </div>

              {m.role === "organizer" ? (
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-600">
                  Edita
                </span>
              ) : canManage ? (
                <button
                  type="button"
                  onClick={() => setMemberCanEdit(m.id, !m.canEdit)}
                  role="switch"
                  aria-checked={m.canEdit}
                  aria-label={`Permiso de edición para ${m.user.fullName}`}
                  className={`relative h-5 w-9 shrink-0 rounded-full transition ${
                    m.canEdit ? "bg-sky-500" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
                      m.canEdit ? "left-4" : "left-0.5"
                    }`}
                  />
                </button>
              ) : (
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    effectiveCanEdit
                      ? "bg-sky-50 text-sky-600"
                      : "bg-slate-100 text-slate-400"
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
