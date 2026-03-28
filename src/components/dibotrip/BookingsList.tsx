"use client";

import { useState } from "react";
import type { Booking, DayWithActivities } from "@/lib/dibotrip/db/types";
import LocationLink from "./LocationLink";

const TYPE_ORDER = ["flight", "hotel", "car_rental", "activity", "other"] as const;

const TYPE_ICONS: Record<string, string> = {
  flight: "✈️",
  hotel: "🏨",
  car_rental: "🚗",
  activity: "🎟️",
  other: "📋",
};

const TYPE_LABELS: Record<string, string> = {
  flight: "Flights",
  hotel: "Hotels",
  car_rental: "Car Rentals",
  activity: "Activities",
  other: "Other",
};

interface Props {
  bookings: Booking[];
  days: DayWithActivities[];
  onEdit?: (booking: Booking) => void;
}

/** Pull an address string out of a booking's details blob regardless of key name */
function extractAddress(details: Record<string, unknown> | null): string | null {
  if (!details) return null;
  const candidates = [
    details.address,
    details.property_address,
    details.pickup_location,
    details.dropoff_location,
    details.location,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return c.trim();
  }
  return null;
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("T")[0].split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function BookingsList({ bookings, days, onEdit }: Props) {
  const [copied, setCopied] = useState<string | null>(null);

  // Build activity → day lookup
  const activityDayMap = new Map<string, { dayNumber: number; dayTitle: string | null }>();
  for (const day of days) {
    for (const act of day.activities) {
      activityDayMap.set(act.id, {
        dayNumber: day.day_number,
        dayTitle: day.title,
      });
    }
  }

  function copyConf(id: string, num: string) {
    navigator.clipboard.writeText(num).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  const grouped = TYPE_ORDER.map((type) => ({
    type,
    items: bookings.filter((b) => b.type === type),
  })).filter((g) => g.items.length > 0);

  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-10 text-center text-stone-400 text-sm">
        No bookings yet. Use the "Add Booking" button to extract one from a
        confirmation email.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {grouped.map(({ type, items }) => (
        <div key={type} className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          {/* Section header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-stone-100 bg-stone-50">
            <span>{TYPE_ICONS[type]}</span>
            <span className="text-sm font-semibold text-stone-700">
              {TYPE_LABELS[type]}
            </span>
            <span className="ml-auto text-xs text-stone-400">
              {items.length} booking{items.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Rows */}
          {items.map((b, i) => {
            const linkedDay = b.activity_id
              ? activityDayMap.get(b.activity_id)
              : null;

            return (
              <div
                key={b.id}
                className={`px-4 py-4 ${
                  i < items.length - 1 ? "border-b border-stone-100" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Provider */}
                    <p className="font-semibold text-stone-900 text-sm leading-snug">
                      {b.provider}
                    </p>

                    {/* Confirmation number */}
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="font-mono text-xs text-stone-500 tracking-wider">
                        {b.confirmation_number}
                      </span>
                      <button
                        onClick={() => copyConf(b.id, b.confirmation_number)}
                        className="text-stone-300 hover:text-amber-500 transition-colors"
                        title="Copy confirmation number"
                      >
                        {copied === b.id ? (
                          <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                          </svg>
                        )}
                      </button>
                    </div>

                    {/* Address (from details) */}
                    {extractAddress(b.details) && (
                      <LocationLink location={extractAddress(b.details)!} />
                    )}

                    {/* Dates */}
                    {(b.check_in || b.check_out) && (
                      <p className="text-xs text-stone-400 mt-1">
                        {fmtDate(b.check_in)}
                        {b.check_out && ` → ${fmtDate(b.check_out)}`}
                      </p>
                    )}

                    {/* Linked day */}
                    {linkedDay && (
                      <p className="text-xs text-stone-400 mt-0.5">
                        📅 Day {linkedDay.dayNumber}
                        {linkedDay.dayTitle ? ` — ${linkedDay.dayTitle}` : ""}
                      </p>
                    )}

                    {/* Notes */}
                    {b.notes && (
                      <p className="text-xs text-stone-400 mt-1 leading-relaxed line-clamp-2">
                        {b.notes}
                      </p>
                    )}
                  </div>

                  {/* Cost + edit */}
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    {b.cost != null && (
                      <p className="text-sm font-semibold text-stone-900">
                        ${b.cost.toLocaleString()}
                      </p>
                    )}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(b)}
                        className="flex items-center gap-1 text-xs text-stone-300 hover:text-amber-500 transition-colors"
                        title="Edit booking"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                        </svg>
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
