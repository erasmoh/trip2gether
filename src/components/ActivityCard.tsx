"use client";

import { useState } from "react";
import type { ActivityWithComments } from "@/lib/types";
import { isFullyConfirmed, setActivityConfirmation } from "@/lib/supabase/queries";
import { Avatar } from "./Avatar";
import { CommentThread } from "./CommentThread";

export function ActivityCard({
  activity,
  currentUserId,
  memberIds,
  onCommentAdded,
  onConfirmationChanged,
}: {
  activity: ActivityWithComments;
  currentUserId: string;
  /** userIds of every current trip member — determines when "confirmedBy" counts as unanimous. */
  memberIds: string[];
  onCommentAdded: () => void;
  onConfirmationChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const confirmedByMe = activity.confirmedBy.some((u) => u.id === currentUserId);
  const fullyConfirmed = isFullyConfirmed(activity, memberIds);

  async function toggleConfirm() {
    setConfirming(true);
    try {
      await setActivityConfirmation(activity.id, currentUserId, !confirmedByMe);
      onConfirmationChanged();
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div
      className={`rounded-lg border p-5 transition ${
        fullyConfirmed ? "border-moss/50 bg-moss/5" : "border-line bg-paper-raised"
      }`}
    >
      <div className="flex gap-5">
        <div className="w-16 shrink-0 pt-0.5">
          {activity.startTime ? (
            <>
              <div className="font-mono text-sm font-medium text-ink">
                {activity.startTime}
              </div>
              {activity.endTime && (
                <div className="font-mono text-[11px] text-muted">
                  {activity.endTime}
                </div>
              )}
            </>
          ) : (
            <div className="font-mono text-[11px] text-muted">s/ hora</div>
          )}
        </div>
        <div className="min-w-0 flex-1 border-l border-line pl-5">
          <div className="flex items-start justify-between gap-3">
            <h4 className="font-display text-lg leading-tight tracking-tight text-ink">
              {activity.title}
            </h4>
            {fullyConfirmed && (
              <span className="eyebrow shrink-0 text-moss">✓ Confirmada</span>
            )}
          </div>
          {activity.location && (
            <p className="eyebrow mt-1 text-muted">{activity.location}</p>
          )}
          {activity.description && (
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              {activity.description}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={toggleConfirm}
              disabled={confirming}
              role="switch"
              aria-checked={confirmedByMe}
              className={`eyebrow rounded-full border px-3 py-1 transition disabled:opacity-40 ${
                confirmedByMe
                  ? "border-moss bg-moss/10 text-moss"
                  : "border-line text-ink-soft hover:border-clay hover:text-clay"
              }`}
            >
              {confirmedByMe ? "✓ Confirmé" : "Confirmar"}
            </button>

            {activity.confirmedBy.length > 0 && (
              <div className="flex -space-x-1.5">
                {activity.confirmedBy.slice(0, 5).map((u) => (
                  <span key={u.id} className="rounded-full ring-2 ring-paper-raised">
                    <Avatar user={u} size="sm" />
                  </span>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="eyebrow text-clay transition hover:opacity-70"
            >
              {open
                ? "Ocultar comentarios"
                : `Comentarios · ${activity.comments.length}`}
            </button>
          </div>

          {open && (
            <CommentThread
              activityId={activity.id}
              comments={activity.comments}
              currentUserId={currentUserId}
              onAdded={onCommentAdded}
            />
          )}
        </div>
      </div>
    </div>
  );
}
