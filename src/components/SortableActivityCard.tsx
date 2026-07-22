"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ActivityWithComments } from "@/lib/types";
import { ActivityCard } from "./ActivityCard";

/** Wraps ActivityCard with a drag handle for reordering within a day.
 * ActivityCard itself stays drag-agnostic; only the handle is draggable so
 * dragging never conflicts with clicking "Confirmar"/comments inside the card. */
export function SortableActivityCard({
  activity,
  draggable,
  currentUserId,
  memberIds,
  onCommentAdded,
  onConfirmationChanged,
}: {
  activity: ActivityWithComments;
  draggable: boolean;
  currentUserId: string;
  memberIds: string[];
  onCommentAdded: () => void;
  onConfirmationChanged: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: activity.id,
    disabled: !draggable,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-start gap-1 ${isDragging ? "z-10 opacity-60" : ""}`}
    >
      {draggable && (
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Reordenar actividad"
          className="mt-5 shrink-0 touch-none px-1 text-base leading-none text-muted transition hover:text-ink active:cursor-grabbing"
        >
          ⠿
        </button>
      )}
      <div className="min-w-0 flex-1">
        <ActivityCard
          activity={activity}
          currentUserId={currentUserId}
          memberIds={memberIds}
          onCommentAdded={onCommentAdded}
          onConfirmationChanged={onConfirmationChanged}
        />
      </div>
    </div>
  );
}
