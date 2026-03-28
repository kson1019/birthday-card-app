"use client";

import { useState } from "react";
import type { ActivityCategory, ActivityWithBookings } from "@/lib/dibotrip/db/types";
import type { ActivityUpdate } from "./EditModeContext";

const CATEGORIES: ActivityCategory[] = [
  "hike",
  "meal",
  "drive",
  "sightseeing",
  "rest",
  "explore",
  "gear",
  "flight",
  "other",
];

const CATEGORY_LABELS: Record<ActivityCategory, string> = {
  hike: "🥾 Hike",
  meal: "🍽 Meal",
  drive: "🚗 Drive",
  sightseeing: "🏛 Sightseeing",
  rest: "😴 Rest",
  explore: "🧭 Explore",
  gear: "🎒 Gear",
  flight: "✈️ Flight",
  other: "📌 Other",
};

interface Props {
  activity: ActivityWithBookings;
  onSave: (updates: ActivityUpdate) => void;
  onCancel: () => void;
}

export default function ActivityEditor({ activity, onSave, onCancel }: Props) {
  const [title, setTitle] = useState(activity.title);
  const [timeStart, setTimeStart] = useState(activity.time_start ?? "");
  const [location, setLocation] = useState(activity.location ?? "");
  const [category, setCategory] = useState<ActivityCategory | null>(
    activity.category ?? null
  );
  const [notes, setNotes] = useState(activity.notes ?? "");

  function handleSave() {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      time_start: timeStart.trim() || null,
      location: location.trim() || null,
      category,
      notes: notes.trim() || null,
    });
  }

  return (
    <div className="ml-5 my-2 bg-stone-50 border border-stone-200 rounded-xl p-3 space-y-2.5">
      {/* Title */}
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Activity title"
        className="w-full text-sm font-medium bg-white border border-stone-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
        onKeyDown={(e) => e.key === "Enter" && handleSave()}
      />

      <div className="grid grid-cols-2 gap-2">
        {/* Time */}
        <input
          value={timeStart}
          onChange={(e) => setTimeStart(e.target.value)}
          placeholder="Time (e.g. 08:00)"
          className="text-sm bg-white border border-stone-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
        />

        {/* Category */}
        <select
          value={category ?? ""}
          onChange={(e) =>
            setCategory((e.target.value as ActivityCategory) || null)
          }
          className="text-sm bg-white border border-stone-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <option value="">No category</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
      </div>

      {/* Location */}
      <input
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Location (optional)"
        className="w-full text-sm bg-white border border-stone-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
      />

      {/* Notes */}
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes (optional)"
        rows={2}
        className="w-full text-sm bg-white border border-stone-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
      />

      {/* Actions */}
      <div className="flex items-center gap-2 pt-0.5">
        <button
          onClick={handleSave}
          disabled={!title.trim()}
          className="text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-40 px-3 py-1.5 rounded-lg transition-colors"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="text-sm text-stone-400 hover:text-stone-600 px-2 py-1.5 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
