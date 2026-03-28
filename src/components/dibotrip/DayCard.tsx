"use client";

import { useState, useEffect, useRef } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import type { DayWithActivities, ActivityWithBookings } from "@/lib/dibotrip/db/types";
import { useEditMode } from "./EditModeContext";
import CategoryPill from "./CategoryPill";
import ActivityRow from "./ActivityRow";
import ActivityEditor from "./ActivityEditor";
import TipCallout from "./TipCallout";

// Rotating accent colors for day badges
const BADGE_COLORS = [
  "bg-orange-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-emerald-500",
  "bg-sky-500",
  "bg-violet-500",
];

function formatDayDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

interface Props {
  day: DayWithActivities;
  initiallyOpen?: boolean;
  /** When true, wraps with useSortable for day-level drag-and-drop */
  sortable?: boolean;
}

// ─── Sortable activity wrapper (used inside DayCard in edit mode) ─────────────

function SortableActivityItem({
  activity,
  children,
}: {
  activity: ActivityWithBookings;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-5 h-8 flex items-center justify-center text-stone-300 hover:text-stone-400 cursor-grab active:cursor-grabbing touch-none z-10"
        aria-label="Drag to reorder"
        tabIndex={-1}
      >
        <svg
          viewBox="0 0 10 16"
          className="w-2.5 h-3.5 fill-current"
        >
          <circle cx="3" cy="2" r="1.5" />
          <circle cx="7" cy="2" r="1.5" />
          <circle cx="3" cy="8" r="1.5" />
          <circle cx="7" cy="8" r="1.5" />
          <circle cx="3" cy="14" r="1.5" />
          <circle cx="7" cy="14" r="1.5" />
        </svg>
      </button>
      {children}
    </div>
  );
}

// ─── Main DayCard component ───────────────────────────────────────────────────

export default function DayCard({
  day,
  initiallyOpen = false,
  sortable = false,
}: Props) {
  const ctx = useEditMode();
  const isEditing = ctx?.isEditing ?? false;

  const [isOpen, setIsOpen] = useState(initiallyOpen || isEditing);

  // Local editable copies
  const [localActivities, setLocalActivities] = useState<ActivityWithBookings[]>(
    day.activities
  );
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(day.title ?? `Day ${day.day_number}`);
  const [editingTip, setEditingTip] = useState(false);
  const [tipValue, setTipValue] = useState(day.tip ?? "");

  // Keep local activities in sync when parent updates (add/delete from outside)
  const prevDayIdRef = useRef(day.id);
  useEffect(() => {
    if (day.id !== prevDayIdRef.current) {
      prevDayIdRef.current = day.id;
    }
    setLocalActivities(day.activities);
    setTitleValue(day.title ?? `Day ${day.day_number}`);
    setTipValue(day.tip ?? "");
  }, [day.activities, day.title, day.tip, day.day_number, day.id]);

  // Auto-open when edit mode is activated
  useEffect(() => {
    if (isEditing) setIsOpen(true);
  }, [isEditing]);

  const badgeColor = BADGE_COLORS[(day.day_number - 1) % BADGE_COLORS.length];

  const tags: string[] = day.tags?.length
    ? day.tags
    : [
        ...Array.from(
          new Set(
            day.activities
              .map((a) => a.category)
              .filter(Boolean)
              .map((c) => c!.charAt(0).toUpperCase() + c!.slice(1))
          )
        ),
      ];

  // ─── DnD for activity reordering ──────────────────────────────────────────

  const activitySensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleActivityDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = localActivities.findIndex((a) => a.id === active.id);
    const newIdx = localActivities.findIndex((a) => a.id === over.id);
    const reordered = arrayMove(localActivities, oldIdx, newIdx);
    setLocalActivities(reordered);
    ctx?.onReorderActivities(day.id, reordered.map((a) => a.id));
  }

  // Mobile arrow reorder helpers
  function moveActivityUp(idx: number) {
    if (idx === 0) return;
    const reordered = [...localActivities];
    [reordered[idx - 1], reordered[idx]] = [reordered[idx], reordered[idx - 1]];
    setLocalActivities(reordered);
    ctx?.onReorderActivities(day.id, reordered.map((a) => a.id));
  }

  function moveActivityDown(idx: number) {
    if (idx === localActivities.length - 1) return;
    const reordered = [...localActivities];
    [reordered[idx], reordered[idx + 1]] = [reordered[idx + 1], reordered[idx]];
    setLocalActivities(reordered);
    ctx?.onReorderActivities(day.id, reordered.map((a) => a.id));
  }

  // ─── Day-level sortable (for day reordering) ──────────────────────────────

  const {
    attributes: dayDragAttrs,
    listeners: dayDragListeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: day.id, disabled: !sortable || !isEditing });

  const sortableStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  // ─── Title save / cancel ───────────────────────────────────────────────────

  function saveTitle() {
    setEditingTitle(false);
    if (titleValue.trim() !== (day.title ?? `Day ${day.day_number}`)) {
      ctx?.onUpdateDay(day.id, { title: titleValue.trim() || null });
    }
  }

  function saveTip() {
    setEditingTip(false);
    ctx?.onUpdateDay(day.id, { tip: tipValue.trim() || null });
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  const isSkipped = day.skipped === 1;

  return (
    <div
      ref={setNodeRef}
      style={sortableStyle}
      className={`bg-white rounded-2xl border transition-all ${
        isDragging ? "shadow-lg ring-2 ring-amber-400" : "border-stone-200 shadow-sm"
      } ${isSkipped && !isEditing ? "opacity-60" : ""}`}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div
        className={`px-4 py-4 flex items-start gap-3 ${
          isEditing ? "" : "hover:bg-stone-50/70 transition-colors cursor-pointer rounded-2xl"
        }`}
        onClick={() => !isEditing && setIsOpen((v) => !v)}
      >
        {/* Day drag handle (edit mode) */}
        {isEditing && sortable && (
          <button
            {...dayDragAttrs}
            {...dayDragListeners}
            className="flex-shrink-0 mt-2 w-5 h-8 flex items-center justify-center text-stone-300 hover:text-stone-400 cursor-grab active:cursor-grabbing touch-none"
            aria-label="Drag day"
            tabIndex={-1}
          >
            <svg viewBox="0 0 10 16" className="w-2.5 h-3.5 fill-current">
              <circle cx="3" cy="2" r="1.5" />
              <circle cx="7" cy="2" r="1.5" />
              <circle cx="3" cy="8" r="1.5" />
              <circle cx="7" cy="8" r="1.5" />
              <circle cx="3" cy="14" r="1.5" />
              <circle cx="7" cy="14" r="1.5" />
            </svg>
          </button>
        )}

        {/* Day badge */}
        <div
          className={`w-9 h-9 rounded-full ${badgeColor} flex items-center justify-center flex-shrink-0 mt-0.5`}
        >
          <span className="text-white text-xs font-bold leading-none">
            D{day.day_number}
          </span>
        </div>

        {/* Title + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            {/* Title — editable in edit mode */}
            {isEditing && editingTitle ? (
              <input
                autoFocus
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveTitle();
                  if (e.key === "Escape") {
                    setTitleValue(day.title ?? `Day ${day.day_number}`);
                    setEditingTitle(false);
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 font-semibold text-stone-900 text-base bg-stone-100 border border-stone-300 rounded-lg px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            ) : (
              <p
                className={`font-semibold text-base leading-snug ${
                  isSkipped ? "line-through text-stone-400" : "text-stone-900"
                }`}
                onClick={(e) => {
                  if (isEditing) {
                    e.stopPropagation();
                    setEditingTitle(true);
                  }
                }}
                title={isEditing ? "Click to edit title" : undefined}
              >
                {titleValue || `Day ${day.day_number}`}
                {isEditing && (
                  <span className="ml-1.5 text-xs text-stone-300 font-normal">✏</span>
                )}
              </p>
            )}

            <div className="flex items-center gap-1.5 flex-shrink-0 pt-0.5">
              <span className="text-xs text-stone-400 whitespace-nowrap">
                {formatDayDate(day.date)}
              </span>

              {/* Edit mode controls */}
              {isEditing ? (
                <>
                  {/* Skip/restore */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      ctx?.onToggleSkipDay(day.id, day.skipped);
                    }}
                    title={isSkipped ? "Restore day" : "Skip day"}
                    className="w-6 h-6 flex items-center justify-center rounded text-stone-300 hover:text-amber-500 hover:bg-amber-50 transition-colors"
                  >
                    {isSkipped ? (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                    )}
                  </button>

                  {/* Delete day */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete Day ${day.day_number}? All activities in this day will be removed.`)) {
                        ctx?.onDeleteDay(day.id);
                      }
                    }}
                    title="Delete day"
                    className="w-6 h-6 flex items-center justify-center rounded text-stone-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  {/* Expand toggle in edit mode */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen((v) => !v);
                    }}
                    className="w-6 h-6 flex items-center justify-center text-stone-300 hover:text-stone-500 transition-colors"
                  >
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </>
              ) : (
                <svg
                  className={`w-4 h-4 text-stone-300 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </div>
          </div>

          {/* Subtitle */}
          {day.subtitle && (
            <p className="text-sm text-stone-400 mt-0.5 leading-snug line-clamp-1">
              {day.subtitle}
            </p>
          )}

          {/* Category pills (collapsed) */}
          {!isOpen && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.slice(0, 5).map((tag) => (
                <CategoryPill key={tag} label={tag} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Expanded body ───────────────────────────────────────────────────── */}
      {isOpen && (
        <div className="px-4 pb-5 border-t border-stone-100">
          {/* Subtitle inside expanded */}
          {day.subtitle && (
            <p className="text-sm text-stone-500 pt-3 pb-2 leading-relaxed">
              {day.subtitle}
            </p>
          )}

          {/* Activity list */}
          {isEditing ? (
            <div className="pt-4">
              {localActivities.length === 0 && (
                <p className="text-sm text-stone-400 py-3 text-center">
                  No activities yet. Add one below.
                </p>
              )}
              {/* Drag-to-reorder context */}
              <DndContext
                sensors={activitySensors}
                collisionDetection={closestCenter}
                onDragEnd={handleActivityDragEnd}
              >
                <SortableContext
                  items={localActivities.map((a) => a.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {localActivities.map((activity, i) => (
                    <div key={activity.id}>
                      {editingActivityId === activity.id ? (
                        /* Inline editor */
                        <ActivityEditor
                          activity={activity}
                          onSave={(updates) => {
                            ctx?.onUpdateActivity(activity.id, updates);
                            setEditingActivityId(null);
                          }}
                          onCancel={() => setEditingActivityId(null)}
                        />
                      ) : (
                        /* Activity row with edit controls */
                        <SortableActivityItem activity={activity}>
                          <div className="pl-5">
                            <div className="relative group/activity">
                              <ActivityRow
                                activity={activity}
                                isLast={i === localActivities.length - 1}
                              />
                              {/* Overlay controls */}
                              <div className="absolute right-0 top-0 bottom-0 flex items-start pt-1 gap-1 bg-gradient-to-l from-white via-white/90 to-transparent pl-4">
                                {/* Mobile up/down arrows */}
                                <div className="flex flex-col gap-0.5 sm:hidden">
                                  <button
                                    onClick={() => moveActivityUp(i)}
                                    disabled={i === 0}
                                    className="w-5 h-5 flex items-center justify-center rounded text-stone-300 hover:text-stone-500 disabled:opacity-20 transition-colors"
                                    title="Move up"
                                  >
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => moveActivityDown(i)}
                                    disabled={i === localActivities.length - 1}
                                    className="w-5 h-5 flex items-center justify-center rounded text-stone-300 hover:text-stone-500 disabled:opacity-20 transition-colors"
                                    title="Move down"
                                  >
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </button>
                                </div>

                                {/* Edit button */}
                                <button
                                  onClick={() => setEditingActivityId(activity.id)}
                                  className="w-6 h-6 flex items-center justify-center rounded text-stone-300 hover:text-amber-500 hover:bg-amber-50 transition-colors"
                                  title="Edit activity"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                                  </svg>
                                </button>

                                {/* Delete button */}
                                <button
                                  onClick={() =>
                                    ctx?.onDeleteActivity(activity.id, day.id)
                                  }
                                  className="w-6 h-6 flex items-center justify-center rounded text-stone-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                                  title="Delete activity"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            </div>

                            {/* Move to another day */}
                            {ctx && ctx.allDays.length > 1 && (
                              <div className="mt-0.5 mb-2 flex items-center gap-1">
                                <span className="text-xs text-stone-300">Move to:</span>
                                <select
                                  defaultValue=""
                                  onChange={(e) => {
                                    const targetId = e.target.value;
                                    if (targetId && targetId !== day.id) {
                                      ctx.onMoveActivity(activity.id, targetId);
                                    }
                                    e.target.value = "";
                                  }}
                                  className="text-xs text-stone-500 bg-transparent border-none focus:ring-0 cursor-pointer py-0 pl-0 pr-4"
                                >
                                  <option value="" disabled>
                                    day…
                                  </option>
                                  {ctx.allDays
                                    .filter((d) => d.id !== day.id)
                                    .map((d) => (
                                      <option key={d.id} value={d.id}>
                                        D{d.day_number}
                                        {d.title ? ` — ${d.title}` : ""}
                                      </option>
                                    ))}
                                </select>
                              </div>
                            )}
                          </div>
                        </SortableActivityItem>
                      )}
                    </div>
                  ))}
                </SortableContext>
              </DndContext>

              {/* Add activity button */}
              <button
                onClick={async () => {
                  const newId = await ctx?.onAddActivity(day.id);
                  if (newId) setEditingActivityId(newId);
                }}
                className="mt-3 w-full flex items-center justify-center gap-1.5 border border-dashed border-stone-200 rounded-xl py-2.5 text-xs text-stone-400 hover:text-stone-600 hover:border-stone-300 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add activity
              </button>
            </div>
          ) : (
            /* View mode */
            <div>
              {localActivities.length === 0 ? (
                <p className="text-sm text-stone-400 py-6 text-center">
                  No activities planned for this day.
                </p>
              ) : (
                <div className="pt-4">
                  {localActivities.map((activity, i) => (
                    <ActivityRow
                      key={activity.id}
                      activity={activity}
                      isLast={i === localActivities.length - 1}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Day tip */}
          {isEditing ? (
            <div className="mt-3">
              {editingTip ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-xs font-semibold text-amber-700 mb-1.5">💡 Tip</p>
                  <textarea
                    autoFocus
                    value={tipValue}
                    onChange={(e) => setTipValue(e.target.value)}
                    rows={2}
                    placeholder="Add a tip for this day…"
                    className="w-full text-sm text-amber-800 bg-white border border-amber-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                  />
                  <div className="flex gap-2 mt-1.5">
                    <button
                      onClick={saveTip}
                      className="text-xs font-semibold text-amber-700 hover:text-amber-800"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setTipValue(day.tip ?? "");
                        setEditingTip(false);
                      }}
                      className="text-xs text-stone-400 hover:text-stone-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setEditingTip(true)}
                  className="w-full text-left border border-dashed border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-600 hover:bg-amber-50 transition-colors"
                >
                  {day.tip ? `💡 ${day.tip}` : "💡 Add a tip for this day…"}
                </button>
              )}
            </div>
          ) : (
            day.tip && <TipCallout tip={day.tip} />
          )}
        </div>
      )}
    </div>
  );
}
