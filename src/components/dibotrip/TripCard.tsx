import Link from "next/link";
import type { Trip } from "@/lib/dibotrip/db/types";
import StatusBadge from "./StatusBadge";
import DeleteTripButton from "./DeleteTripButton";

// Static gradient pairs — full class strings required for Tailwind to include them
const GRADIENTS = [
  "from-orange-400 via-amber-400 to-yellow-400",
  "from-rose-400 via-orange-400 to-amber-400",
  "from-amber-500 via-orange-400 to-rose-400",
  "from-orange-500 via-amber-500 to-yellow-500",
  "from-red-400 via-rose-400 to-orange-400",
  "from-yellow-400 via-amber-400 to-orange-500",
];

function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDateRange(start: string, end: string): string {
  const s = parseLocalDate(start);
  const e = parseLocalDate(end);
  const monthFmt: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const startStr = s.toLocaleDateString("en-US", monthFmt);
  const endStr = e.toLocaleDateString("en-US", { ...monthFmt, year: "numeric" });
  return `${startStr} – ${endStr}`;
}

function getDayCount(start: string, end: string): number {
  const s = parseLocalDate(start);
  const e = parseLocalDate(end);
  return Math.round((e.getTime() - s.getTime()) / 86_400_000) + 1;
}

export default function TripCard({
  trip,
  index,
}: {
  trip: Trip;
  index: number;
}) {
  const gradient = GRADIENTS[index % GRADIENTS.length];
  const dayCount = getDayCount(trip.start_date, trip.end_date);

  return (
    <div className="group relative rounded-2xl overflow-hidden bg-white shadow-sm ring-1 ring-black/5 hover:shadow-md hover:ring-black/10 transition-all duration-200 flex flex-col">
      {/* Full-card link overlay — z-10 puts it above normal content */}
      <Link
        href={`/dibotrip/${trip.id}`}
        className="absolute inset-0 z-10"
        aria-label={trip.name}
      />

      {/* Cover */}
      <div className="relative h-36 overflow-hidden">
        {trip.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={trip.cover_image_url}
            alt={trip.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${gradient} group-hover:scale-105 transition-transform duration-300`}
          />
        )}
        {/* Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

        {/* Day count pill — top right */}
        <div className="absolute top-3 right-3">
          <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-2 py-0.5 rounded-full">
            {dayCount}d
          </span>
        </div>

        {/* Status badge — bottom left */}
        <div className="absolute bottom-3 left-3">
          <StatusBadge status={trip.status!} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-0.5 flex-1 bg-white">
        <h3 className="font-semibold text-stone-900 text-base leading-snug line-clamp-2">
          {trip.name}
        </h3>
        <p className="text-sm text-stone-500 truncate">{trip.destination}</p>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-stone-400">
            {formatDateRange(trip.start_date, trip.end_date)}
          </p>
          {/* z-20 places this above the z-10 link overlay so it captures clicks */}
          <div className="relative z-20">
            <DeleteTripButton key={trip.id} tripId={trip.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
