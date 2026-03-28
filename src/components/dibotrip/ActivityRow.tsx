import type { ActivityWithBookings } from "@/lib/dibotrip/db/types";
import CategoryDot from "./CategoryDot";
import BookingTag from "./BookingTag";
import LocationLink from "./LocationLink";

interface Props {
  activity: ActivityWithBookings;
  isLast: boolean;
}

export default function ActivityRow({ activity, isLast }: Props) {
  return (
    <div className="flex items-start gap-0">
      {/* Time column */}
      <div className="w-14 flex-shrink-0 text-right pr-3 pt-0.5">
        {activity.time_start && (
          <span className="text-xs text-stone-400 font-medium leading-none">
            {activity.time_start}
          </span>
        )}
      </div>

      {/* Dot + vertical connector */}
      <div className="flex flex-col items-center flex-shrink-0 mr-3">
        <CategoryDot category={activity.category} />
        {!isLast && (
          <div className="w-px bg-stone-100 flex-1 mt-1 min-h-[24px]" />
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 min-w-0 ${!isLast ? "pb-5" : ""}`}>
        <p className="font-semibold text-stone-900 text-sm leading-snug">
          {activity.title}
        </p>

        {activity.location && (
          <LocationLink
            location={activity.location}
            lat={activity.latitude}
            lng={activity.longitude}
          />
        )}

        {activity.notes && (
          <p className="text-sm text-stone-500 mt-1.5 leading-relaxed">
            {activity.notes}
          </p>
        )}

        {activity.bookings.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {activity.bookings.map((b) => (
              <BookingTag key={b.id} booking={b} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
