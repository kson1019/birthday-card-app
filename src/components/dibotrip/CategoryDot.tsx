import type { ActivityCategory } from "@/lib/dibotrip/db/types";

// Full class strings so Tailwind includes them
const COLORS: Record<string, string> = {
  hike: "bg-emerald-500",
  meal: "bg-amber-500",
  drive: "bg-stone-400",
  sightseeing: "bg-sky-500",
  explore: "bg-blue-500",
  rest: "bg-violet-400",
  gear: "bg-stone-500",
  flight: "bg-cyan-500",
  other: "bg-stone-300",
};

export default function CategoryDot({
  category,
}: {
  category: ActivityCategory | null;
}) {
  const color = COLORS[category ?? "other"] ?? COLORS.other;
  return (
    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5 ${color}`} />
  );
}
