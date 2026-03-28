import type { Booking } from "@/lib/dibotrip/db/types";

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
  car_rental: "Car rentals",
  activity: "Activities",
  other: "Other",
};

export default function BookingSummaryBar({ bookings }: { bookings: Booking[] }) {
  const total = bookings.reduce((s, b) => s + (b.cost ?? 0), 0);
  const countByType = bookings.reduce<Record<string, number>>((acc, b) => {
    acc[b.type] = (acc[b.type] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4 mb-4 flex flex-wrap items-center gap-4">
      {/* Total */}
      <div className="flex-shrink-0">
        <p className="text-xs text-stone-400">Total booked</p>
        <p className="text-xl font-bold text-stone-900">
          {total > 0 ? `$${total.toLocaleString()}` : "—"}
        </p>
      </div>

      <div className="w-px h-8 bg-stone-100 flex-shrink-0 hidden sm:block" />

      {/* By type */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(countByType).map(([type, count]) => (
          <div key={type} className="flex items-center gap-1.5 text-sm text-stone-600">
            <span>{TYPE_ICONS[type] ?? "📋"}</span>
            <span className="font-medium">{count}</span>
            <span className="text-stone-400">{TYPE_LABELS[type] ?? type}</span>
          </div>
        ))}
        {bookings.length === 0 && (
          <p className="text-sm text-stone-400">No bookings yet</p>
        )}
      </div>
    </div>
  );
}
