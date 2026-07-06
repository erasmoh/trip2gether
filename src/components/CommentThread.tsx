"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { formatRelativeTime } from "@/lib/format";
import type { CommentWithUser } from "@/lib/types";
import { Avatar } from "./Avatar";

export function CommentThread({
  activityId,
  comments,
}: {
  activityId: string;
  comments: CommentWithUser[];
}) {
  const { addComment } = useStore();
  const [body, setBody] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;
    addComment(activityId, trimmed);
    setBody("");
  }

  return (
    <div className="mt-3 border-t border-slate-100 pt-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Comentarios ({comments.length})
      </p>

      <ul className="space-y-2">
        {comments.map((c) => (
          <li key={c.id} className="flex gap-2">
            <Avatar user={c.user} size="sm" />
            <div className="flex-1 rounded-lg bg-slate-50 px-3 py-2">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium text-slate-800">
                  {c.user.fullName}
                </span>
                <span className="text-[11px] text-slate-400">
                  {formatRelativeTime(c.createdAt)}
                </span>
              </div>
              <p className="text-sm text-slate-600">{c.body}</p>
            </div>
          </li>
        ))}
        {comments.length === 0 && (
          <li className="text-sm text-slate-400">
            Sé el primero en comentar esta actividad.
          </li>
        )}
      </ul>

      <form onSubmit={submit} className="mt-2 flex gap-2">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Escribe un comentario…"
          className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
        />
        <button
          type="submit"
          disabled={!body.trim()}
          className="rounded-lg bg-sky-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-sky-600 disabled:opacity-40"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
