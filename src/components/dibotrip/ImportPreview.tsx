"use client";

import type { ImportPayload } from "@/lib/dibotrip/db/types";

const BOOKING_ICONS: Record<string, string> = {
  flight: "✈️",
  hotel: "🏨",
  car_rental: "🚗",
  activity: "🎫",
  other: "📋",
};

function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDateRange(start: string, end: string): string {
  const s = parseLocalDate(start);
  const e = parseLocalDate(end);
  const fmt: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${s.toLocaleDateString("en-US", fmt)} – ${e.toLocaleDateString("en-US", { ...fmt, year: "numeric" })}`;
}

interface Props {
  payload: ImportPayload;
  onConfirm: () => void;
  onBack: () => void;
  error?: string | null;
  saving?: boolean;
}

export default function ImportPreview({
  payload,
  onConfirm,
  onBack,
  error,
  saving,
}: Props) {
  const { trip, itinerary, bookings, packing } = payload;
  const totalActivities = itinerary.reduce(
    (sum, d) => sum + d.activities.length,
    0
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Success header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <svg
            className="w-4 h-4 text-emerald-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-stone-900">Trip extracted successfully</p>
          <p className="text-sm text-stone-400">Review the details below, then confirm to save.</p>
        </div>
      </div>

      {/* Trip info card */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 space-y-1">
        <h2 className="font-bold text-stone-900 text-lg leading-snug">{trip.name}</h2>
        <p className="text-stone-500 text-sm">{trip.destination}</p>
        <p className="text-stone-400 text-xs">{formatDateRange(trip.start_date, trip.end_date)}</p>
        {trip.notes && (
          <p className="text-stone-500 text-sm pt-1 border-t border-stone-100 mt-2">{trip.notes}</p>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon="📅" label="Days" value={itinerary.length} />
        <StatCard icon="🏃" label="Activities" value={totalActivities} />
        <StatCard
          icon="🎫"
          label={bookings.length === 1 ? "Booking" : "Bookings"}
          value={bookings.length}
        />
      </div>

      {/* Days list */}
      {itinerary.length > 0 && (
        <Section title={`${itinerary.length} days planned`} icon="📅">
          <div className="space-y-1.5">
            {itinerary.map((day, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-xs font-bold text-stone-400 w-6 flex-shrink-0 pt-0.5">
                  D{day.day_number ?? i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-stone-700 font-medium leading-snug">
                    {day.title ?? "Untitled day"}
                  </p>
                  {day.subtitle && (
                    <p className="text-xs text-stone-400">{day.subtitle}</p>
                  )}
                  <p className="text-xs text-stone-300 mt-0.5">
                    {day.activities.length}{" "}
                    {day.activities.length === 1 ? "activity" : "activities"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Bookings list */}
      {bookings.length > 0 && (
        <Section title={`${bookings.length} ${bookings.length === 1 ? "booking" : "bookings"}`} icon="🎫">
          <div className="space-y-2">
            {bookings.map((b, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 bg-stone-50 rounded-lg px-3 py-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base">{BOOKING_ICONS[b.type] ?? "📋"}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-stone-800 truncate">
                      {b.provider}
                    </p>
                    <p className="text-xs text-stone-400 capitalize">
                      {b.type.replace("_", " ")}
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs font-semibold text-stone-600 bg-white border border-stone-200 px-2 py-0.5 rounded flex-shrink-0">
                  {b.confirmation_number}
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Packing items */}
      {packing.length > 0 && (
        <Section title={`${packing.length} packing ${packing.length === 1 ? "item" : "items"}`} icon="🧳">
          <p className="text-sm text-stone-500">
            {packing
              .slice(0, 5)
              .map((p) => p.item)
              .join(", ")}
            {packing.length > 5 && ` + ${packing.length - 5} more`}
          </p>
        </Section>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-700">
          <p className="font-medium mb-0.5">Failed to save</p>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <button
          onClick={onBack}
          disabled={saving}
          className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 disabled:opacity-40 transition-colors"
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
          Back to edit
        </button>

        <button
          onClick={onConfirm}
          disabled={saving}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-stone-200 disabled:text-stone-400 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors duration-150 shadow-sm"
        >
          {saving ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating trip…
            </>
          ) : (
            <>
              Looks good — Create Trip
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-3 text-center">
      <p className="text-xl">{icon}</p>
      <p className="text-xl font-bold text-stone-900 mt-1">{value}</p>
      <p className="text-xs text-stone-400 mt-0.5">{label}</p>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <p className="text-sm font-semibold text-stone-700">{title}</p>
      </div>
      {children}
    </div>
  );
}
