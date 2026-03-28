"use client";

import { useState } from "react";
import type { ImportBooking } from "@/lib/dibotrip/db/types";

export type ActivityOption = {
  id: string;
  title: string;
  dayNumber: number;
  dayTitle: string | null;
};

const TYPE_OPTIONS = [
  { value: "flight", label: "✈️ Flight" },
  { value: "hotel", label: "🏨 Hotel" },
  { value: "car_rental", label: "🚗 Car rental" },
  { value: "activity", label: "🎟️ Activity" },
  { value: "other", label: "📋 Other" },
] as const;

const TYPE_ICONS: Record<string, string> = {
  flight: "✈️",
  hotel: "🏨",
  car_rental: "🚗",
  activity: "🎟️",
  other: "📋",
};

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("T")[0].split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export interface BookingDraft {
  type: ImportBooking["type"];
  provider: string;
  confirmation_number: string;
  check_in: string | null | undefined;
  check_out: string | null | undefined;
  cost: number | null | undefined;
  notes: string | null | undefined;
  details: Record<string, unknown> | null | undefined;
  linked_activity_hint?: string | null;
}

interface Props {
  booking: ImportBooking;
  activities: ActivityOption[];
  linkedActivityId: string | null;
  onLinkChange: (id: string | null) => void;
  /** Receives the live editable draft whenever a field changes */
  onDraftChange: (draft: BookingDraft) => void;
}

export default function BookingPreview({
  booking,
  activities,
  linkedActivityId,
  onLinkChange,
  onDraftChange,
}: Props) {
  const [provider, setProvider] = useState(booking.provider ?? "");
  const [confNum, setConfNum] = useState(booking.confirmation_number ?? "");
  const [type, setType] = useState<ImportBooking["type"]>(booking.type ?? "other");

  function emit(overrides: Partial<BookingDraft> = {}) {
    onDraftChange({
      type,
      provider,
      confirmation_number: confNum,
      check_in: booking.check_in,
      check_out: booking.check_out,
      cost: booking.cost,
      notes: booking.notes,
      details: booking.details,
      linked_activity_hint: booking.linked_activity_hint,
      ...overrides,
    });
  }

  function handleProviderChange(v: string) {
    setProvider(v);
    emit({ provider: v });
  }

  function handleConfNumChange(v: string) {
    setConfNum(v);
    emit({ confirmation_number: v });
  }

  function handleTypeChange(v: ImportBooking["type"]) {
    setType(v);
    emit({ type: v });
  }

  const icon = TYPE_ICONS[type] ?? "📋";
  const missing = !provider.trim() || !confNum.trim();

  return (
    <div className="space-y-3">
      {/* Type */}
      <div>
        <label className="text-xs font-medium text-stone-500 block mb-1.5">
          Booking type
        </label>
        <div className="flex flex-wrap gap-2">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleTypeChange(opt.value)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                type === opt.value
                  ? "bg-amber-500 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Provider — editable */}
      <div>
        <label className="text-xs font-medium text-stone-500 block mb-1.5">
          Provider / Company{" "}
          <span className="text-red-400">*</span>
        </label>
        <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5">
          <span className="text-lg">{icon}</span>
          <input
            value={provider}
            onChange={(e) => handleProviderChange(e.target.value)}
            placeholder="e.g. Southwest Airlines, Airbnb"
            className={`flex-1 text-sm bg-transparent focus:outline-none placeholder:text-stone-300 ${
              !provider.trim() ? "border-b border-red-300" : ""
            }`}
          />
        </div>
        {!provider.trim() && (
          <p className="text-xs text-red-400 mt-1">Required — type the provider name</p>
        )}
      </div>

      {/* Confirmation number — editable */}
      <div>
        <label className="text-xs font-medium text-stone-500 block mb-1.5">
          Confirmation / Reference #{" "}
          <span className="text-red-400">*</span>
        </label>
        <input
          value={confNum}
          onChange={(e) => handleConfNumChange(e.target.value)}
          placeholder="e.g. ABCD1234"
          className={`w-full font-mono text-sm bg-stone-50 border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 ${
            !confNum.trim() ? "border-red-200" : "border-stone-200"
          }`}
        />
        {!confNum.trim() && (
          <p className="text-xs text-red-400 mt-1">
            Required — enter the booking reference number
          </p>
        )}
      </div>

      {/* Warning banner when AI couldn't auto-fill */}
      {missing && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 leading-relaxed">
          <span className="font-semibold">Couldn&apos;t auto-extract all fields.</span>{" "}
          Fill in the required fields above before saving.
        </div>
      )}

      {/* Dates */}
      {(booking.check_in || booking.check_out) && (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-stone-50 rounded-xl px-3 py-2.5">
            <p className="text-xs text-stone-400 mb-0.5">From / Check-in</p>
            <p className="text-sm text-stone-700">{fmtDate(booking.check_in)}</p>
          </div>
          <div className="bg-stone-50 rounded-xl px-3 py-2.5">
            <p className="text-xs text-stone-400 mb-0.5">To / Check-out</p>
            <p className="text-sm text-stone-700">{fmtDate(booking.check_out)}</p>
          </div>
        </div>
      )}

      {/* Cost */}
      {booking.cost != null && (
        <div className="bg-stone-50 rounded-xl px-4 py-3">
          <p className="text-xs text-stone-400 mb-0.5">Cost</p>
          <p className="text-sm font-semibold text-stone-900">
            ${booking.cost.toLocaleString()}
          </p>
        </div>
      )}

      {/* Notes */}
      {booking.notes && (
        <div className="bg-stone-50 rounded-xl px-4 py-3">
          <p className="text-xs text-stone-400 mb-0.5">Notes</p>
          <p className="text-sm text-stone-600 leading-relaxed">{booking.notes}</p>
        </div>
      )}

      {/* Link to activity */}
      <div>
        <label className="text-xs font-medium text-stone-500 block mb-1.5">
          Link to activity{" "}
          <span className="font-normal text-stone-400">(optional)</span>
        </label>
        <select
          value={linkedActivityId ?? ""}
          onChange={(e) => onLinkChange(e.target.value || null)}
          className="w-full text-sm border border-stone-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <option value="">No specific activity</option>
          {activities.map((a) => (
            <option key={a.id} value={a.id}>
              D{a.dayNumber}
              {a.dayTitle ? ` — ${a.dayTitle}` : ""} · {a.title}
            </option>
          ))}
        </select>
        {booking.linked_activity_hint && (
          <p className="text-xs text-stone-400 mt-1">
            💡 AI suggested:{" "}
            <em className="text-stone-500">{booking.linked_activity_hint}</em>
          </p>
        )}
      </div>
    </div>
  );
}
