"use client";

import Link from "next/link";
import type { TripWithDays } from "@/lib/dibotrip/db/types";
import StatusBadge from "./StatusBadge";
import { useEditMode } from "./EditModeContext";

function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDateRange(start: string, end: string): string {
  const s = parseLocalDate(start);
  const e = parseLocalDate(end);
  const fmt: Intl.DateTimeFormatOptions = { month: "long", day: "numeric" };
  return `${s.toLocaleDateString("en-US", fmt)} – ${e.toLocaleDateString("en-US", { ...fmt, year: "numeric" })}`;
}

export default function TripHeader({
  trip,
  onAddBooking,
}: {
  trip: TripWithDays;
  onAddBooking?: () => void;
}) {
  const ctx = useEditMode();
  const totalActivities = trip.days.reduce(
    (sum, d) => sum + d.activities.length,
    0
  );
  const totalCost = trip.bookings.reduce((sum, b) => sum + (b.cost ?? 0), 0);

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 mb-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-stone-900 leading-tight">
            {trip.name}
          </h1>
          <p className="text-stone-500 mt-0.5 truncate">{trip.destination}</p>
          <p className="text-sm text-stone-400 mt-1">
            {formatDateRange(trip.start_date, trip.end_date)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0 pt-0.5">
          <StatusBadge status={trip.status!} />
          {ctx && !ctx.isEditing && (
            <button
              onClick={ctx.startEditing}
              className="flex items-center gap-1.5 text-xs font-medium text-stone-400 hover:text-amber-600 hover:bg-amber-50 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"
                />
              </svg>
              Edit trip
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm border-t border-stone-100 pt-3">
        <Stat icon="📅" label={`${trip.days.length} day${trip.days.length !== 1 ? "s" : ""}`} />
        <Stat icon="🏃" label={`${totalActivities} activities`} />
        {trip.bookings.length > 0 && (
          <Stat icon="🎫" label={`${trip.bookings.length} booking${trip.bookings.length !== 1 ? "s" : ""}`} />
        )}
        {totalCost > 0 && (
          <Stat icon="💰" label={`$${totalCost.toLocaleString()}`} />
        )}
      </div>

      {/* Quick-access nav + Add Booking */}
      {!ctx?.isEditing && (
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-stone-100">
          <Link
            href={`/dibotrip/${trip.id}/bookings`}
            className="flex items-center gap-1.5 text-xs font-medium text-stone-400 hover:text-amber-600 hover:bg-amber-50 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            🎫 View bookings
          </Link>
          <Link
            href={`/dibotrip/${trip.id}/expenses`}
            className="flex items-center gap-1.5 text-xs font-medium text-stone-400 hover:text-amber-600 hover:bg-amber-50 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            💰 View expenses
          </Link>
          {onAddBooking && (
            <button
              onClick={onAddBooking}
              className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Booking
            </button>
          )}
        </div>
      )}

      {trip.notes && (
        <p className="text-sm text-stone-500 mt-3 pt-3 border-t border-stone-100 leading-relaxed">
          {trip.notes}
        </p>
      )}
    </div>
  );
}

function Stat({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-stone-500">
      <span>{icon}</span>
      <span>{label}</span>
    </span>
  );
}
