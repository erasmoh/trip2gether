"use client";

import { useState } from "react";
import type { ActivityWithComments } from "@/lib/types";
import { CommentThread } from "./CommentThread";

export function ActivityCard({ activity }: { activity: ActivityWithComments }) {
  const [open, setOpen] = useState(false);
  const timeLabel = activity.endTime
    ? `${activity.startTime} – ${activity.endTime}`
    : activity.startTime;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex gap-4">
        <div className="w-20 shrink-0 text-sm font-semibold text-sky-600">
          {timeLabel}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-slate-900">{activity.title}</h4>
          {activity.location && (
            <p className="text-xs text-slate-400">📍 {activity.location}</p>
          )}
          <p className="mt-1 text-sm text-slate-600">{activity.description}</p>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="mt-2 text-xs font-medium text-sky-600 hover:underline"
          >
            {open
              ? "Ocultar comentarios"
              : `Comentarios (${activity.comments.length})`}
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
