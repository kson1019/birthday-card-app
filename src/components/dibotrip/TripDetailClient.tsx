"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
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
} from "@dnd-kit/sortable";

import type {
  TripWithDays,
  DayWithActivities,
  ActivityWithBookings,
} from "@/lib/dibotrip/db/types";
import {
  EditModeContext,
  type ActivityUpdate,
  type DayUpdate,
} from "./EditModeContext";
import TripHeader from "./TripHeader";
import DayCard from "./DayCard";
import EditModeBanner from "./EditModeBanner";
import AddBookingSheet from "./AddBookingSheet";
import TripMap from "./TripMap";

interface Props {
  initialTrip: TripWithDays;
}

export default function TripDetailClient({ initialTrip }: Props) {
  const router = useRouter();
  const [days, setDays] = useState<DayWithActivities[]>(initialTrip.days);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddBooking, setShowAddBooking] = useState(false);
  const tripId = initialTrip.id;


  // ─── Activity mutations ──────────────────────────────────────────────────────

  const onUpdateActivity = useCallback(
    async (activityId: string, updates: ActivityUpdate) => {
      // When time_start changes, re-sort the day's activities chronologically
      // and persist the new sort order alongside the activity update.
      let reorderInfo: { dayId: string; ids: string[] } | null = null as { dayId: string; ids: string[] } | null;

      setDays((prev) =>
        prev.map((day) => {
          const idx = day.activities.findIndex((a) => a.id === activityId);
          if (idx === -1) return day;

          const patched = day.activities.map((a) =>
            a.id === activityId ? { ...a, ...updates } : a
          );

          if (updates.time_start !== undefined) {
            const sorted = [...patched].sort((a, b) => {
              const ta = a.time_start;
              const tb = b.time_start;
              if (!ta && !tb) return 0;
              if (!ta) return 1;
              if (!tb) return -1;
              return ta.localeCompare(tb);
            });
            reorderInfo = { dayId: day.id, ids: sorted.map((a) => a.id) };
            return { ...day, activities: sorted };
          }

          return { ...day, activities: patched };
        })
      );

      // Save the activity itself
      const res = await fetch(`/api/activities/${activityId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) toast.error("Failed to save activity — refresh to restore");

      // Persist the new sort order if we re-sorted
      if (reorderInfo) {
        await fetch(`/api/days/${reorderInfo.dayId}/activities/reorder`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ activityIds: reorderInfo.ids }),
        });
      }
    },
    []
  );

  const onDeleteActivity = useCallback(
    async (activityId: string, dayId: string) => {
      setDays((prev) =>
        prev.map((day) =>
          day.id === dayId
            ? { ...day, activities: day.activities.filter((a) => a.id !== activityId) }
            : day
        )
      );
      const res = await fetch(`/api/activities/${activityId}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Failed to delete activity");
        router.refresh();
      } else {
        toast.success("Activity removed");
      }
    },
    [router]
  );

  const onAddActivity = useCallback(async (dayId: string): Promise<string | null> => {
    const res = await fetch(`/api/days/${dayId}/activities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "New activity", category: "other" }),
    });
    if (!res.ok) {
      toast.error("Failed to add activity");
      return null;
    }
    const { data } = await res.json();
    const newActivity: ActivityWithBookings = { ...data, bookings: [] };
    setDays((prev) =>
      prev.map((day) =>
        day.id === dayId
          ? { ...day, activities: [...day.activities, newActivity] }
          : day
      )
    );
    return newActivity.id;
  }, []);

  const onReorderActivities = useCallback(
    async (dayId: string, orderedIds: string[]) => {
      setDays((prev) =>
        prev.map((day) => {
          if (day.id !== dayId) return day;
          const byId = new Map(day.activities.map((a) => [a.id, a]));
          const reordered = orderedIds
            .map((id, i) => {
              const a = byId.get(id);
              return a ? { ...a, sort_order: i } : null;
            })
            .filter(Boolean) as ActivityWithBookings[];
          return { ...day, activities: reordered };
        })
      );
      const res = await fetch(`/api/days/${dayId}/activities/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activityIds: orderedIds }),
      });
      if (!res.ok) toast.error("Failed to save new order");
    },
    []
  );

  const onMoveActivity = useCallback(
    async (activityId: string, targetDayId: string) => {
      let moved: ActivityWithBookings | undefined;

      setDays((prev) => {
        const next = prev.map((day) => {
          const idx = day.activities.findIndex((a) => a.id === activityId);
          if (idx === -1) return day;
          moved = day.activities[idx];
          return { ...day, activities: day.activities.filter((a) => a.id !== activityId) };
        });
        if (!moved) return prev;
        return next.map((day) =>
          day.id === targetDayId
            ? {
                ...day,
                activities: [
                  ...day.activities,
                  { ...moved!, sort_order: day.activities.length, day_id: targetDayId },
                ],
              }
            : day
        );
      });

      const targetDay = days.find((d) => d.id === targetDayId);
      const label = targetDay
        ? `D${targetDay.day_number}${targetDay.title ? ` — ${targetDay.title}` : ""}`
        : "another day";

      const res = await fetch(`/api/activities/${activityId}/move`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetDayId, targetSortOrder: 999 }),
      });
      if (!res.ok) {
        toast.error("Failed to move activity");
      } else {
        toast.success(`Moved to ${label}`);
      }
    },
    [days]
  );

  // ─── Day mutations ───────────────────────────────────────────────────────────

  const onUpdateDay = useCallback(async (dayId: string, updates: DayUpdate) => {
    setDays((prev) =>
      prev.map((day) => (day.id === dayId ? { ...day, ...updates } : day))
    );
    const res = await fetch(`/api/days/${dayId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) toast.error("Failed to update day");
  }, []);

  const onDeleteDay = useCallback(
    async (dayId: string) => {
      setDays((prev) => prev.filter((d) => d.id !== dayId));
      const res = await fetch(`/api/days/${dayId}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Failed to delete day");
        router.refresh();
      } else {
        toast.success("Day removed");
      }
    },
    [router]
  );

  const onToggleSkipDay = useCallback(
    async (dayId: string, currentSkipped: number) => {
      const newSkipped = currentSkipped === 0 ? 1 : 0;
      setDays((prev) =>
        prev.map((day) =>
          day.id === dayId ? { ...day, skipped: newSkipped } : day
        )
      );
      const res = await fetch(`/api/days/${dayId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skipped: newSkipped }),
      });
      if (!res.ok) {
        toast.error("Failed to update day");
      } else {
        toast.success(newSkipped === 1 ? "Day skipped" : "Day restored");
      }
    },
    []
  );

  const onAddDay = useCallback(async () => {
    const lastDay = days[days.length - 1];
    const newDayNumber = (lastDay?.day_number ?? 0) + 1;

    let newDate = new Date().toISOString().split("T")[0];
    if (lastDay?.date) {
      const [y, m, d] = lastDay.date.split("-").map(Number);
      const next = new Date(y, m - 1, d + 1);
      newDate = [
        next.getFullYear(),
        String(next.getMonth() + 1).padStart(2, "0"),
        String(next.getDate()).padStart(2, "0"),
      ].join("-");
    }

    const res = await fetch(`/api/trips/${tripId}/days`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        day_number: newDayNumber,
        date: newDate,
        title: `Day ${newDayNumber}`,
      }),
    });
    if (!res.ok) {
      toast.error("Failed to add day");
      return;
    }
    const { data } = await res.json();
    setDays((prev) => [...prev, { ...data, activities: [] }]);
    toast.success("Day added");
  }, [days, tripId]);

  const onReorderDays = useCallback(
    async (orderedIds: string[]) => {
      setDays((prev) => {
        const byId = new Map(prev.map((d) => [d.id, d]));
        return orderedIds
          .map((id, i) => {
            const d = byId.get(id);
            return d ? { ...d, day_number: i + 1 } : null;
          })
          .filter(Boolean) as DayWithActivities[];
      });
      const res = await fetch(`/api/trips/${tripId}/days/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dayIds: orderedIds }),
      });
      if (!res.ok) toast.error("Failed to save day order");
    },
    [tripId]
  );

  // ─── DnD sensors for day reordering ─────────────────────────────────────────

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDayDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = days.findIndex((d) => d.id === active.id);
      const newIndex = days.findIndex((d) => d.id === over.id);
      const reordered = arrayMove(days, oldIndex, newIndex);
      onReorderDays(reordered.map((d) => d.id));
    }
  }

  // ─── Context value ───────────────────────────────────────────────────────────

  const allDays = days.map((d) => ({
    id: d.id,
    day_number: d.day_number,
    title: d.title,
  }));

  const contextValue = {
    isEditing,
    startEditing: () => setIsEditing(true),
    stopEditing: () => setIsEditing(false),
    allDays,
    tripId,
    onUpdateActivity,
    onDeleteActivity,
    onAddActivity,
    onReorderActivities,
    onMoveActivity,
    onUpdateDay,
    onDeleteDay,
    onToggleSkipDay,
    onAddDay,
    onReorderDays,
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  const tripForHeader = { ...initialTrip, days, bookings: initialTrip.bookings };

  return (
    <EditModeContext.Provider value={contextValue}>
      <main className="min-h-screen bg-stone-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
          {/* Back nav */}
          <Link
            href="/dibotrip"
            className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-stone-600 transition-colors mb-5"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            All trips
          </Link>

          {/* Edit mode banner */}
          {isEditing && <EditModeBanner />}

          {/* Interactive map */}
          {!isEditing && <TripMap days={days} />}

          {/* Trip header */}
          <TripHeader
            trip={tripForHeader}
            onAddBooking={() => setShowAddBooking(true)}
          />

          {/* Day list */}
          {days.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center text-stone-400 text-sm">
              No itinerary days yet.
            </div>
          ) : isEditing ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDayDragEnd}
            >
              <SortableContext
                items={days.map((d) => d.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {days.map((day, i) => (
                    <DayCard
                      key={day.id}
                      day={day}
                      initiallyOpen={i === 0}
                      sortable
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="space-y-3">
              {days.map((day, i) => (
                <DayCard key={day.id} day={day} initiallyOpen={i === 0} />
              ))}
            </div>
          )}

          {/* Add day button (edit mode only) */}
          {isEditing && (
            <button
              onClick={onAddDay}
              className="mt-3 w-full flex items-center justify-center gap-2 bg-white border border-dashed border-stone-300 rounded-2xl py-4 text-sm text-stone-400 hover:text-stone-600 hover:border-stone-400 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              Add another day
            </button>
          )}

          <div className="h-10" />
        </div>
      </main>
      {showAddBooking && (
        <AddBookingSheet
          tripId={tripId}
          days={days}
          onClose={() => setShowAddBooking(false)}
          onSaved={() => router.refresh()}
        />
      )}
    </EditModeContext.Provider>
  );
}
