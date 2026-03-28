import type { DayWithActivities } from "@/lib/dibotrip/db/types";

const BADGE_COLORS = [
  "#f97316", // orange-500
  "#f59e0b", // amber-500
  "#f43f5e", // rose-500
  "#10b981", // emerald-500
  "#0ea5e9", // sky-500
  "#8b5cf6", // violet-500
];

interface Props {
  days: DayWithActivities[];
  selectedDay: number | null;
  onSelectDay: (day: number | null) => void;
}

export default function MapDaySelector({ days, selectedDay, onSelectDay }: Props) {
  const daysWithCoords = days.filter((d) =>
    d.activities.some((a) => a.latitude != null && a.longitude != null)
  );

  if (daysWithCoords.length < 2) return null;

  return (
    <div className="flex items-center gap-2 mt-2 overflow-x-auto pb-1 scrollbar-hide">
      <button
        onClick={() => onSelectDay(null)}
        className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
          selectedDay === null
            ? "bg-stone-800 text-white border-stone-800"
            : "bg-white text-stone-500 border-stone-200 hover:border-stone-400"
        }`}
      >
        All days
      </button>

      {daysWithCoords.map((day) => {
        const color = BADGE_COLORS[(day.day_number - 1) % BADGE_COLORS.length];
        const isSelected = selectedDay === day.day_number;
        return (
          <button
            key={day.id}
            onClick={() => onSelectDay(isSelected ? null : day.day_number)}
            className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold border transition-all"
            style={
              isSelected
                ? { backgroundColor: color, color: "white", borderColor: color }
                : {
                    backgroundColor: "white",
                    color: "#78716c",
                    borderColor: "#e7e5e4",
                  }
            }
          >
            D{day.day_number}
            {day.title ? ` · ${day.title.slice(0, 14)}${day.title.length > 14 ? "…" : ""}` : ""}
          </button>
        );
      })}
    </div>
  );
}
