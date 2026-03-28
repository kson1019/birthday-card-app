import type { TripStatus } from "@/lib/dibotrip/db/types";

const CONFIG: Record<
  TripStatus,
  { label: string; pill: string; dot?: string }
> = {
  active: {
    label: "Active now",
    pill: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
  },
  upcoming: {
    label: "Upcoming",
    pill: "bg-sky-100 text-sky-700",
  },
  completed: {
    label: "Completed",
    pill: "bg-stone-100 text-stone-500",
  },
  draft: {
    label: "Draft",
    pill: "bg-amber-100 text-amber-700",
  },
};

export default function StatusBadge({ status }: { status: TripStatus }) {
  const { label, pill, dot } = CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${pill}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dot} animate-pulse`} />
      )}
      {label}
    </span>
  );
}
