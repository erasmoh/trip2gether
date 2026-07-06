"use client";

import { useState } from "react";
import type { ActivityWithComments } from "@/lib/types";
import { CommentThread } from "./CommentThread";

export function ActivityCard({ activity }: { activity: ActivityWithComments }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-line bg-paper-raised p-5">
      <div className="flex gap-5">
        <div className="w-16 shrink-0 pt-0.5">
          <div className="font-mono text-sm font-medium text-ink">
            {activity.startTime}
          </div>
          {activity.endTime && (
            <div className="font-mono text-[11px] text-muted">
              {activity.endTime}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 border-l border-line pl-5">
          <h4 className="font-display text-lg leading-tight tracking-tight text-ink">
            {activity.title}
          </h4>
          {activity.location && (
            <p className="eyebrow mt-1 text-muted">{activity.location}</p>
          )}
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            {activity.description}
          </p>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="eyebrow mt-3 text-clay transition hover:opacity-70"
          >
            {open
              ? "Ocultar comentarios"
              : `Comentarios · ${activity.comments.length}`}
          </button>

          {open && (
            <CommentThread
              activityId={activity.id}
              comments={activity.comments}
            />
          )}
        </div>
      </div>
    </div>
  );
}
