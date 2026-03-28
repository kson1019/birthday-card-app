// Full class strings so Tailwind includes them at build time
const STYLES: Record<string, string> = {
  hike: "bg-emerald-100 text-emerald-700",
  meal: "bg-amber-100 text-amber-700",
  drive: "bg-stone-100 text-stone-500",
  sightseeing: "bg-sky-100 text-sky-700",
  explore: "bg-blue-100 text-blue-700",
  rest: "bg-violet-100 text-violet-700",
  gear: "bg-stone-100 text-stone-600",
  flight: "bg-cyan-100 text-cyan-700",
  other: "bg-stone-100 text-stone-500",
};

export default function CategoryPill({ label }: { label: string }) {
  const style = STYLES[label.toLowerCase()] ?? STYLES.other;
  return (
    <span
      className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${style}`}
    >
      {label}
    </span>
  );
}
