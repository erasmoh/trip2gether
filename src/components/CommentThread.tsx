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
    <div className="mt-4 border-t border-line pt-4">
      <p className="eyebrow mb-3 text-muted">Comentarios · {comments.length}</p>

      <ul className="space-y-2">
        {comments.map((c) => (
          <li key={c.id} className="flex gap-2">
            <Avatar user={c.user} size="sm" />
            <div className="flex-1 rounded-lg border border-line bg-paper px-3 py-2">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium text-ink">
                  {c.user.fullName}
                </span>
                <span className="font-mono text-[11px] text-muted">
                  {formatRelativeTime(c.createdAt)}
                </span>
              </div>
              <p className="text-sm text-ink-soft">{c.body}</p>
            </div>
          </li>
        ))}
        {comments.length === 0 && (
          <li className="text-sm text-muted">
            Sé el primero en comentar esta actividad.
          </li>
        )}
      </ul>

      <form onSubmit={submit} className="mt-2 flex gap-2">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Escribe un comentario…"
          className="flex-1 rounded-lg border border-line bg-paper-raised px-3 py-1.5 text-sm text-ink outline-none focus:border-clay focus:ring-1 focus:ring-clay"
        />
        <button
          type="submit"
          disabled={!body.trim()}
          className="rounded-lg bg-ink px-3 py-1.5 text-sm font-medium text-paper transition hover:bg-ink/85 disabled:opacity-40"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
